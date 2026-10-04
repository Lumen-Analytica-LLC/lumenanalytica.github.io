import { watchTheme } from '../../render/canvas';
import { ColdStorageSim, type ColdStorageConfig, DEFAULT_CONFIG, formatClock } from './model';
import { ColdStorageRenderer } from './renderer';

const SPEED = 10;
const START = 10 * 60 + 15;
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/**
 * Compact, self-running cross-dock twin for hero sections: facility view, clock and a few
 * headline numbers. Starts as the morning wave builds and loops the day.
 */
export function mountColdStoragePreview(root: HTMLElement, overrides: Partial<ColdStorageConfig> = {}): void {
	const canvas = root.querySelector<HTMLCanvasElement>('[data-floor]')!;
	const clock = root.querySelector<HTMLElement>('[data-clock]')!;
	const stat = (name: string) => root.querySelector<HTMLElement>(`[data-stat="${name}"]`)!;

	const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const config: ColdStorageConfig = { ...DEFAULT_CONFIG, ...overrides };
	let sim = new ColdStorageSim(config);
	// With reduced motion, show a busy afternoon snapshot instead of animating.
	let simTime = reducedMotion ? 15 * 60 : START;
	sim.advance(simTime);

	const renderer = new ColdStorageRenderer(canvas, root);
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
				if (simTime > 21 * 60) {
					sim = new ColdStorageSim({ ...config, seed: config.seed + 1 + Math.floor(Math.random() * 1000) });
					simTime = START;
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
				clock.textContent = formatClock(sim.now);
				stat('yard').textContent = String(m.inYard);
				stat('detention').textContent = money.format(m.detentionCost);
				stat('excursions').textContent = String(m.excursions);
			}
		}
		requestAnimationFrame(frame);
	}
	requestAnimationFrame(frame);
}
