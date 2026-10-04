import { fitCanvas, readTheme, type Theme, withAlpha } from '../../render/canvas';
import { CLOSE, type ClinicSim, OPEN } from './model';

const ROW_HEIGHT = 34;
const AXIS_HEIGHT = 22;
const BOOKED_DURATION = 18;
const MIN_END = 18 * 60 + 30;

/**
 * Provider availability board: what was booked (top band of each row) against what
 * actually happened (bottom band), with a moving "now" line.
 */
export class ProviderBoard {
	private readonly ctx: CanvasRenderingContext2D;
	private theme: Theme;
	private width = 0;
	private dpr = 1;
	private readonly stopFit: () => void;

	constructor(
		private readonly canvas: HTMLCanvasElement,
		private readonly themeRoot: Element,
	) {
		this.ctx = canvas.getContext('2d')!;
		this.theme = readTheme(themeRoot);
		this.stopFit = fitCanvas(canvas, (width) => {
			this.width = width;
			this.dpr = canvas.width / Math.max(1, width);
		});
	}

	refreshTheme(): void {
		this.theme = readTheme(this.themeRoot);
	}

	destroy(): void {
		this.stopFit();
	}

	/** CSS height the canvas needs for this many providers. */
	static heightFor(providers: number): number {
		return AXIS_HEIGHT + providers * ROW_HEIGHT + 6;
	}

	draw(sim: ClinicSim): void {
		const { ctx, theme: t } = this;
		const gutter = this.width < 520 ? 44 : 96;
		const end = Math.max(MIN_END, Math.ceil((sim.now + 30) / 60) * 60);
		const x = (minutes: number) => gutter + ((minutes - OPEN) / (end - OPEN)) * (this.width - gutter - 8);

		ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
		ctx.clearRect(0, 0, this.width, this.canvas.height / this.dpr);
		ctx.font = '500 11px "Public Sans", system-ui, sans-serif';
		ctx.textBaseline = 'middle';

		// Hour grid
		for (let h = Math.ceil(OPEN / 60); h * 60 <= end; h++) {
			const hx = x(h * 60);
			ctx.fillStyle = t.furniture;
			ctx.fillRect(Math.round(hx), AXIS_HEIGHT - 4, 1, sim.providers.length * ROW_HEIGHT + 4);
			ctx.fillStyle = t.label;
			ctx.textAlign = 'center';
			const label = h % 12 === 0 ? '12p' : h > 12 ? `${h - 12}p` : `${h}a`;
			if (this.width >= 520 || h % 2 === 0) ctx.fillText(label, hx, AXIS_HEIGHT / 2);
		}

		// Clinic close
		ctx.fillStyle = withAlpha(t.bad, 0.08);
		ctx.fillRect(x(CLOSE), AXIS_HEIGHT, x(end) - x(CLOSE), sim.providers.length * ROW_HEIGHT);

		sim.providers.forEach((provider, row) => {
			const top = AXIS_HEIGHT + row * ROW_HEIGHT;

			ctx.fillStyle = provider.status === 'away' ? t.label : t['label-strong'];
			ctx.textAlign = 'left';
			ctx.fillText(this.width < 520 ? provider.initials : provider.name, 4, top + ROW_HEIGHT / 2);

			// Booked appointments (stacked when double- or block-booked)
			const counts = new Map<number, number>();
			for (const appt of provider.booked) counts.set(appt, (counts.get(appt) ?? 0) + 1);
			for (const [appt, count] of counts) {
				const bx = x(appt);
				const bw = Math.max(2, x(appt + BOOKED_DURATION) - bx - 1);
				ctx.fillStyle = withAlpha(t.provider, count > 1 ? 0.35 : 0.18);
				ctx.fillRect(bx, top + 5, bw, 8);
				if (count > 1 && bw > 14) {
					ctx.fillStyle = t['label-strong'];
					ctx.textAlign = 'center';
					ctx.font = '600 9px "Public Sans", system-ui, sans-serif';
					ctx.fillText(`×${count}`, bx + bw / 2, top + 9.5);
					ctx.font = '500 11px "Public Sans", system-ui, sans-serif';
				}
			}

			// What actually happened
			for (const segment of provider.segments) {
				const sx = x(segment.start);
				const sw = Math.max(1, x(segment.end) - sx);
				if (segment.kind === 'away') {
					this.hatch(sx, top + 16, sw, 13, t.away);
				} else {
					ctx.fillStyle = segment.kind === 'visit' ? t.visit : withAlpha(t.visit, 0.35);
					ctx.fillRect(sx, top + 16, sw, 13);
				}
			}

			ctx.fillStyle = t.furniture;
			ctx.fillRect(gutter, top + ROW_HEIGHT - 1, this.width - gutter - 8, 1);
		});

		// Now line
		const nx = x(sim.now);
		ctx.fillStyle = t['label-strong'];
		ctx.fillRect(Math.round(nx) - 1, AXIS_HEIGHT - 4, 2, sim.providers.length * ROW_HEIGHT + 4);
	}

	private hatch(x: number, y: number, w: number, h: number, color: string): void {
		const { ctx } = this;
		ctx.save();
		ctx.beginPath();
		ctx.rect(x, y, w, h);
		ctx.clip();
		ctx.fillStyle = withAlpha(color, 0.25);
		ctx.fillRect(x, y, w, h);
		ctx.strokeStyle = color;
		ctx.lineWidth = 1;
		for (let d = -h; d < w; d += 5) {
			ctx.beginPath();
			ctx.moveTo(x + d, y + h);
			ctx.lineTo(x + d + h, y);
			ctx.stroke();
		}
		ctx.restore();
	}
}
