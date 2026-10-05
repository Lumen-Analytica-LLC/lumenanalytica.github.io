import type { Lang } from '../../../i18n';
import { COLD_TEXT } from '../../../i18n/twins';
import { watchTheme } from '../../render/canvas';
import { DockBoard } from './board';
import {
	type ArrivalPattern,
	type ColdStorageConfig,
	type ColdStorageMetrics,
	ColdStorageSim,
	DAY_END,
	DEFAULT_CONFIG,
	EXCURSION_MINUTES,
	formatClock,
	OPEN,
	PATTERNS,
	type Priority,
	PRIORITIES,
} from './model';
import { MAX_FORKLIFTS, MAX_INBOUND_DOORS, OUTBOUND_DOORS } from './layout';
import { ColdStorageRenderer } from './renderer';

type Tone = 'good' | 'warn' | 'bad' | 'neutral';

/** Short URL keys so a scenario can be shared as a link. */
const URL_KEYS: Record<keyof ColdStorageConfig, string> = {
	seed: 's',
	forklifts: 'f',
	doors: 'd',
	trucksPerDay: 'n',
	pattern: 'a',
	priority: 'pr',
	inspectionPct: 'i',
	precoolCapacity: 'pc',
	surge: 'su',
	forkliftsDown: 'fd',
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function mountColdStorageTwin(root: HTMLElement): void {
	const $ = <T extends Element>(selector: string) => root.querySelector<T>(selector)!;
	const floorCanvas = $<HTMLCanvasElement>('[data-floor]');
	const boardCanvas = $<HTMLCanvasElement>('[data-board]');
	const form = $<HTMLFormElement>('[data-controls]');
	const playButton = $<HTMLButtonElement>('[data-play]');
	const clock = $<HTMLElement>('[data-clock]');
	const log = $<HTMLOListElement>('[data-log]');
	const summary = $<HTMLElement>('[data-summary]');
	const lang: Lang = root.dataset.lang === 'es' ? 'es' : 'en';
	const text = COLD_TEXT[lang];
	const clockText = (t: number) => formatClock(t, lang);

	const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
	let config = readConfigFromUrl();
	let sim = new ColdStorageSim(config);
	let simTime = readStartTimeFromUrl();
	sim.advance(simTime);
	let speed = Number(new FormData(form).get('speed') ?? 8);
	let playing = !reducedMotion;
	let visible = true;
	let snapNext = true;
	let lastFrame = performance.now();
	let lastPanels = 0;
	let renderedLogLength = -1;

	const renderer = new ColdStorageRenderer(floorCanvas, root, lang);
	const board = new DockBoard(boardCanvas, root, lang);
	watchTheme(() => {
		renderer.refreshTheme();
		board.refreshTheme();
	});
	new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(root);

	writeConfigToForm(form, config);
	sizeBoard();
	setPlaying(playing);

	// ------------------------------------------------------------ controls

	form.addEventListener('input', (event) => {
		const target = event.target as HTMLInputElement;
		if (target.name === 'speed') {
			speed = Number(target.value);
			return;
		}
		config = { ...readConfigFromForm(form), seed: config.seed };
		rebuild(simTime);
	});
	form.addEventListener('submit', (event) => event.preventDefault());

	playButton.addEventListener('click', () => {
		if (!playing && !summary.hidden) restart();
		setPlaying(!playing);
	});
	$('[data-restart]').addEventListener('click', () => {
		restart();
		setPlaying(true);
	});
	$('[data-new-day]').addEventListener('click', () => {
		config = { ...config, seed: Math.floor(Math.random() * 1e6) };
		restart();
		setPlaying(true);
	});

	function restart(): void {
		rebuild(OPEN);
	}

	/** Replay the whole day under the current settings up to `time`, with the same trucks. */
	function rebuild(time: number): void {
		sim = new ColdStorageSim(config);
		simTime = time;
		sim.advance(simTime);
		renderer.reset();
		snapNext = true;
		renderedLogLength = -1;
		summary.hidden = true;
		sizeBoard();
		writeConfigToUrl(config);
		updatePanels(true);
	}

	function setPlaying(next: boolean): void {
		playing = next;
		playButton.setAttribute('aria-pressed', String(playing));
		playButton.querySelector('[data-label]')!.textContent = playing ? text.pause : text.play;
	}

	function sizeBoard(): void {
		boardCanvas.style.height = `${DockBoard.heightFor(config.doors + OUTBOUND_DOORS)}px`;
	}

	// ------------------------------------------------------------ loop

	function frame(now: number): void {
		const dt = Math.min(0.1, (now - lastFrame) / 1000);
		lastFrame = now;

		if (visible) {
			if (playing) {
				simTime += dt * speed;
				sim.advance(simTime);
				const finish = sim.metrics().finish;
				if ((finish !== null && sim.now > finish + 20) || simTime >= DAY_END) {
					setPlaying(false);
					showSummary(sim.metrics());
				}
			}
			renderer.frame(sim, { dt, speed, snap: snapNext || reducedMotion });
			snapNext = false;
			board.draw(sim);
			if (now - lastPanels > 250) {
				lastPanels = now;
				updatePanels(false);
			}
		}
		requestAnimationFrame(frame);
	}
	requestAnimationFrame(frame);

	// ------------------------------------------------------------ panels

	function updatePanels(force: boolean): void {
		clock.textContent = clockText(sim.now);
		const m = sim.metrics();
		const excursionShare = m.received ? m.excursions / m.received : 0;
		const sub = text.sub;

		setKpi('turn', minutes(m.avgTurn), toneFor(m.avgTurn, 60, 120), sub.trucksDone(m.trucksDone, m.trucksTotal));
		setKpi('detention', money.format(m.detentionCost), toneFor(m.detentionCost, 250, 1000), sub.detention);
		setKpi('yard', String(m.inYard), toneFor(m.inYard, 2, 5), sub.yard);
		setKpi(
			'excursions',
			String(m.excursions),
			m.received ? toneFor(excursionShare, 0.05, 0.15) : 'neutral',
			sub.excursions(m.received, EXCURSION_MINUTES),
		);
		setKpi('dwell', minutes(m.avgDockDwell), toneFor(m.avgDockDwell, 15, 25), sub.dwell);
		setKpi(
			'utilization',
			m.utilization === null ? '–' : `${Math.round(m.utilization * 100)}%`,
			'neutral',
			sub.drivers(config.forklifts),
		);

		if (force || sim.log.length !== renderedLogLength) renderLog();
	}

	function setKpi(name: string, value: string, tone: Tone, sub: string): void {
		const tile = root.querySelector<HTMLElement>(`[data-kpi="${name}"]`)!;
		tile.dataset.tone = tone;
		tile.querySelector('[data-value]')!.textContent = value;
		tile.querySelector('[data-sub]')!.textContent = sub;
	}

	function renderLog(): void {
		renderedLogLength = sim.log.length;
		const recent = [...sim.log].sort((a, b) => a.time - b.time).slice(-7).reverse();
		log.replaceChildren(
			...recent.map((entry) => {
				const li = document.createElement('li');
				li.dataset.tone = entry.tone;
				const time = document.createElement('time');
				time.textContent = clockText(entry.time);
				li.append(time, ` ${text.event(entry.event)}`);
				return li;
			}),
		);
	}

	function showSummary(m: ColdStorageMetrics): void {
		const suggestion =
			config.priority === 'unload-first'
				? text.suggestions.balanced
				: config.pattern === 'waves'
					? text.suggestions.appointments
					: config.forklifts < 8
						? text.suggestions.driver
						: text.suggestions.surge;
		const ended = m.dayComplete ? text.ended(clockText(m.finish ?? sim.now)) : text.notEnded;
		summary.querySelector('[data-summary-text]')!.textContent = text.summary(
			minutes(m.avgTurn),
			money.format(m.detentionCost),
			m.excursions,
			ended,
			suggestion,
		);
		summary.hidden = false;
	}
}

// ---------------------------------------------------------------- config helpers

function minutes(value: number | null): string {
	return value === null ? '–' : `${Math.round(value)} min`;
}

function toneFor(value: number | null, good: number, warn: number): Tone {
	if (value === null) return 'neutral';
	return value < good ? 'good' : value < warn ? 'warn' : 'bad';
}

function clamp(value: number, min: number, max: number, fallback: number): number {
	return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

function readConfigFromUrl(): ColdStorageConfig {
	const params = new URLSearchParams(location.search);
	const num = (key: keyof ColdStorageConfig, min: number, max: number) =>
		clamp(Number(params.get(URL_KEYS[key]) ?? NaN), min, max, DEFAULT_CONFIG[key] as number);
	const bool = (key: keyof ColdStorageConfig) =>
		params.has(URL_KEYS[key]) ? params.get(URL_KEYS[key]) === '1' : (DEFAULT_CONFIG[key] as boolean);
	const pattern = params.get(URL_KEYS.pattern) as ArrivalPattern | null;
	const priority = params.get(URL_KEYS.priority) as Priority | null;
	return {
		seed: num('seed', 0, 1e9),
		forklifts: Math.round(num('forklifts', 3, MAX_FORKLIFTS)),
		doors: Math.round(num('doors', 3, MAX_INBOUND_DOORS)),
		trucksPerDay: Math.round(num('trucksPerDay', 15, 55)),
		pattern: pattern && pattern in PATTERNS ? pattern : DEFAULT_CONFIG.pattern,
		priority: priority && priority in PRIORITIES ? priority : DEFAULT_CONFIG.priority,
		inspectionPct: num('inspectionPct', 0, 40),
		precoolCapacity: Math.round(num('precoolCapacity', 24, 96)),
		surge: bool('surge'),
		forkliftsDown: bool('forkliftsDown'),
	};
}

/** Optional `at=1030` opens the twin at that time of day. */
function readStartTimeFromUrl(): number {
	const match = /^(\d{1,2})(\d{2})$/.exec(new URLSearchParams(location.search).get('at') ?? '');
	if (!match) return OPEN;
	return clamp(Number(match[1]) * 60 + Number(match[2]), OPEN, DAY_END, OPEN);
}

function writeConfigToUrl(config: ColdStorageConfig): void {
	const params = new URLSearchParams(location.search);
	for (const key of Object.keys(URL_KEYS) as (keyof ColdStorageConfig)[]) {
		const value = config[key];
		if (value === DEFAULT_CONFIG[key]) params.delete(URL_KEYS[key]);
		else params.set(URL_KEYS[key], typeof value === 'boolean' ? (value ? '1' : '0') : String(value));
	}
	const query = params.toString();
	history.replaceState(null, '', `${location.pathname}${query ? `?${query}` : ''}${location.hash}`);
}

function readConfigFromForm(form: HTMLFormElement): Omit<ColdStorageConfig, 'seed'> {
	const data = new FormData(form);
	return {
		forklifts: Number(data.get('forklifts')),
		doors: Number(data.get('doors')),
		trucksPerDay: Number(data.get('trucksPerDay')),
		pattern: data.get('pattern') as ArrivalPattern,
		priority: data.get('priority') as Priority,
		inspectionPct: Number(data.get('inspectionPct')),
		precoolCapacity: Number(data.get('precoolCapacity')),
		surge: data.get('surge') === 'on',
		forkliftsDown: data.get('forkliftsDown') === 'on',
	};
}

function writeConfigToForm(form: HTMLFormElement, config: ColdStorageConfig): void {
	for (const [key, value] of Object.entries(config)) {
		const field = form.elements.namedItem(key);
		if (field instanceof RadioNodeList) field.value = String(value);
		else if (field instanceof HTMLInputElement) {
			if (field.type === 'checkbox') field.checked = Boolean(value);
			else field.value = String(value);
		}
	}
	syncOutputs(form);
	form.addEventListener('input', () => syncOutputs(form));
}

/** Mirror each range input's value into its <output>. */
function syncOutputs(form: HTMLFormElement): void {
	for (const output of form.querySelectorAll<HTMLOutputElement>('output[for]')) {
		const input = form.elements.namedItem(output.htmlFor.value) as HTMLInputElement | null;
		if (input) output.value = `${input.value}${output.dataset.suffix ?? ''}`;
	}
}
