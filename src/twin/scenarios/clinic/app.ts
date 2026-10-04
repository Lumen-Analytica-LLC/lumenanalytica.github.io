import { watchTheme } from '../../render/canvas';
import { ProviderBoard } from './board';
import {
	type ClinicConfig,
	type ClinicMetrics,
	ClinicSim,
	DAY_END,
	DEFAULT_CONFIG,
	formatClock,
	MAX_PROVIDERS,
	MAX_ROOMS,
	OPEN,
	type Template,
	TEMPLATES,
} from './model';
import { ClinicRenderer } from './renderer';

type Tone = 'good' | 'warn' | 'bad' | 'neutral';

/** Short URL keys so a scenario can be shared as a link. */
const URL_KEYS: Record<keyof ClinicConfig, string> = {
	seed: 's',
	providers: 'p',
	rooms: 'r',
	template: 't',
	doubleBookPct: 'db',
	noShowPct: 'ns',
	walkInsPerHour: 'wi',
	disruption: 'd',
};

export function mountClinicTwin(root: HTMLElement): void {
	const $ = <T extends Element>(selector: string) => root.querySelector<T>(selector)!;
	const floorCanvas = $<HTMLCanvasElement>('[data-floor]');
	const boardCanvas = $<HTMLCanvasElement>('[data-board]');
	const form = $<HTMLFormElement>('[data-controls]');
	const playButton = $<HTMLButtonElement>('[data-play]');
	const clock = $<HTMLElement>('[data-clock]');
	const log = $<HTMLOListElement>('[data-log]');
	const summary = $<HTMLElement>('[data-summary]');

	const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
	let config = readConfigFromUrl();
	let sim = new ClinicSim(config);
	let simTime = readStartTimeFromUrl();
	sim.advance(simTime);
	let speed = Number(new FormData(form).get('speed') ?? 8);
	let playing = !reducedMotion;
	let visible = true;
	let snapNext = true;
	let lastFrame = performance.now();
	let lastPanels = 0;
	let renderedLogLength = -1;

	const renderer = new ClinicRenderer(floorCanvas, root);
	const board = new ProviderBoard(boardCanvas, root);
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

	/** Replay the whole day under the current settings up to `time`, with the same patients. */
	function rebuild(time: number): void {
		sim = new ClinicSim(config);
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
		playButton.querySelector('[data-label]')!.textContent = playing ? 'Pause' : 'Play';
	}

	function sizeBoard(): void {
		boardCanvas.style.height = `${ProviderBoard.heightFor(config.providers)}px`;
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
				if ((finish !== null && sim.now > finish + 15) || simTime >= DAY_END) {
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
		clock.textContent = formatClock(sim.now);
		const m = sim.metrics();

		setKpi('avgWait', minutes(m.avgWait), toneFor(m.avgWait, 15, 25), `${m.seen} patients seen`);
		setKpi('p90Wait', minutes(m.p90Wait), toneFor(m.p90Wait, 30, 45), '1 in 10 wait at least this long');
		setKpi('waiting', String(m.inWaitingRoom), toneFor(m.inWaitingRoom, 6, 12), `${m.arrived} arrived so far`);
		setKpi(
			'lwbs',
			String(m.leftWithoutBeingSeen),
			m.leftWithoutBeingSeen === 0 ? 'good' : m.leftWithoutBeingSeen <= 2 ? 'warn' : 'bad',
			'Walk-ins who gave up',
		);
		setKpi(
			'utilization',
			m.utilization === null ? '–' : `${Math.round(m.utilization * 100)}%`,
			'neutral',
			'Provider time with patients',
		);
		setKpi(
			'finish',
			m.finish === null ? 'Running' : formatClock(m.finish),
			m.finish === null ? 'neutral' : toneFor(m.overtime, 10, 30),
			m.overtime > 0 ? `${Math.round(m.overtime)} min past 5:00 PM close` : 'Close is 5:00 PM',
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
		log.replaceChildren(
			...sim.log
				.slice(-7)
				.reverse()
				.map((entry) => {
					const li = document.createElement('li');
					li.dataset.tone = entry.tone;
					const time = document.createElement('time');
					time.textContent = formatClock(entry.time);
					li.append(time, ` ${entry.text}`);
					return li;
				}),
		);
	}

	function showSummary(m: ClinicMetrics): void {
		const suggestion =
			config.template !== 'staggered'
				? 'Try the staggered template and see what happens to the wait.'
				: config.walkInsPerHour > 2
					? 'Try another exam room or provider to absorb the walk-ins.'
					: 'Try pulling a provider away mid-morning to stress-test the day.';
		summary.querySelector('[data-summary-text]')!.textContent =
			`Average wait ${minutes(m.avgWait)}, ${m.leftWithoutBeingSeen} walk-in${m.leftWithoutBeingSeen === 1 ? '' : 's'} lost, ` +
			`last patient out at ${formatClock(m.finish ?? sim.now)}. ${suggestion}`;
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

function readConfigFromUrl(): ClinicConfig {
	const params = new URLSearchParams(location.search);
	const num = (key: keyof ClinicConfig, min: number, max: number) =>
		clamp(Number(params.get(URL_KEYS[key]) ?? NaN), min, max, DEFAULT_CONFIG[key] as number);
	const template = params.get(URL_KEYS.template) as Template | null;
	return {
		seed: num('seed', 0, 1e9),
		providers: Math.round(num('providers', 2, MAX_PROVIDERS)),
		rooms: Math.round(num('rooms', 3, MAX_ROOMS)),
		template: template && template in TEMPLATES ? template : DEFAULT_CONFIG.template,
		doubleBookPct: num('doubleBookPct', 0, 30),
		noShowPct: num('noShowPct', 0, 30),
		walkInsPerHour: num('walkInsPerHour', 0, 6),
		disruption: params.has(URL_KEYS.disruption) ? params.get(URL_KEYS.disruption) === '1' : DEFAULT_CONFIG.disruption,
	};
}

/** Optional `at=1030` opens the twin at that clinic time, e.g. for links that point at a moment in the day. */
function readStartTimeFromUrl(): number {
	const match = /^(\d{1,2})(\d{2})$/.exec(new URLSearchParams(location.search).get('at') ?? '');
	if (!match) return OPEN;
	return clamp(Number(match[1]) * 60 + Number(match[2]), OPEN, DAY_END, OPEN);
}

function writeConfigToUrl(config: ClinicConfig): void {
	const params = new URLSearchParams(location.search);
	for (const key of Object.keys(URL_KEYS) as (keyof ClinicConfig)[]) {
		const value = config[key];
		if (value === DEFAULT_CONFIG[key]) params.delete(URL_KEYS[key]);
		else params.set(URL_KEYS[key], typeof value === 'boolean' ? (value ? '1' : '0') : String(value));
	}
	const query = params.toString();
	history.replaceState(null, '', `${location.pathname}${query ? `?${query}` : ''}${location.hash}`);
}

function readConfigFromForm(form: HTMLFormElement): Omit<ClinicConfig, 'seed'> {
	const data = new FormData(form);
	return {
		providers: Number(data.get('providers')),
		rooms: Number(data.get('rooms')),
		template: data.get('template') as Template,
		doubleBookPct: Number(data.get('doubleBookPct')),
		noShowPct: Number(data.get('noShowPct')),
		walkInsPerHour: Number(data.get('walkInsPerHour')),
		disruption: data.get('disruption') === 'on',
	};
}

function writeConfigToForm(form: HTMLFormElement, config: ClinicConfig): void {
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
