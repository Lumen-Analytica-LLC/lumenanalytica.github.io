import type { Lang } from '../../../i18n';
import { watchTheme } from '../../render/canvas';
import { type ClinicConfig, ClinicSim, DEFAULT_CONFIG, formatClock, OPEN } from './model';
import { ClinicRenderer } from './renderer';

const SPEED = 12;

/**
 * Compact, self-running clinic twin for hero sections: floor plan, clock and a few
 * headline numbers. Loops the day and has no controls.
 */
export function mountClinicPreview(root: HTMLElement, lang: Lang = 'en', overrides: Partial<ClinicConfig> = {}): void {
	const canvas = root.querySelector<HTMLCanvasElement>('[data-floor]')!;
	const clock = root.querySelector<HTMLElement>('[data-clock]')!;
	const values = (name: string) => root.querySelector<HTMLElement>(`[data-stat="${name}"]`)!;

	const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const config: ClinicConfig = { ...DEFAULT_CONFIG, ...overrides };
	let sim = new ClinicSim(config);
	// With reduced motion, show a busy mid-morning snapshot instead of animating.
	let simTime = reducedMotion ? 10 * 60 + 30 : OPEN + 30;
	sim.advance(simTime);

	const renderer = new ClinicRenderer(canvas, root, lang);
	watchTheme(() => renderer.refreshTheme());

	let visible = true;
	let snap = true;
	let lastFrame = performance.now();
	let lastStats = 0;
	new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(root);

	function frame(now: number): void {
		const dt = Math.min(0.1, (now - lastFrame) / 1000);
		lastFrame = now;
		if (visible) {
			if (!reducedMotion) {
				simTime += dt * SPEED;
				sim.advance(simTime);
				const finish = sim.metrics().finish;
				if (finish !== null && sim.now > finish + 20) {
					sim = new ClinicSim({ ...config, seed: config.seed + 1 + Math.floor(Math.random() * 1000) });
					simTime = OPEN + 30;
					sim.advance(simTime);
					renderer.reset();
					snap = true;
				}
			}
			renderer.frame(sim, { dt, speed: SPEED, snap: snap || reducedMotion });
			snap = false;
			if (now - lastStats > 300) {
				lastStats = now;
				const m = sim.metrics();
				clock.textContent = formatClock(sim.now, lang);
				values('waiting').textContent = String(m.inWaitingRoom);
				values('avgWait').textContent = m.avgWait === null ? '–' : `${Math.round(m.avgWait)} min`;
				values('seen').textContent = String(m.seen);
			}
		}
		requestAnimationFrame(frame);
	}
	requestAnimationFrame(frame);
}
