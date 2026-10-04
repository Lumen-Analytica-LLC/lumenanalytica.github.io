import { fitCanvas, readTheme, type Theme, withAlpha } from '../../render/canvas';
import { type ColdStorageSim, FREE_TIME, OPEN } from './model';

const ROW_HEIGHT = 22;
const AXIS_HEIGHT = 22;
const YARD_ROW_HEIGHT = 36;
const MIN_END = 23 * 60;
const BIN = 10;

/**
 * Dock door board: when each door had a truck, with time past free time shown as detention,
 * plus how many trucks were waiting in the yard.
 */
export class DockBoard {
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

	static heightFor(doors: number): number {
		return AXIS_HEIGHT + YARD_ROW_HEIGHT + doors * ROW_HEIGHT + 8;
	}

	draw(sim: ColdStorageSim): void {
		const { ctx, theme: t } = this;
		const narrow = this.width < 520;
		const gutter = narrow ? 40 : 84;
		const end = Math.max(MIN_END, Math.ceil((sim.now + 30) / 60) * 60);
		const x = (minutes: number) => gutter + ((minutes - OPEN) / (end - OPEN)) * (this.width - gutter - 8);
		const rows = [
			...sim.inboundDoors.map((_, door) => ({ kind: 'inbound' as const, door, label: `Door I${door + 1}` })),
			...sim.outboundDoors.map((_, door) => ({ kind: 'outbound' as const, door, label: `Door O${door + 1}` })),
		];
		const rowsTop = AXIS_HEIGHT + YARD_ROW_HEIGHT;
		const bottom = rowsTop + rows.length * ROW_HEIGHT;

		ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
		ctx.clearRect(0, 0, this.width, this.canvas.height / this.dpr);
		ctx.font = '500 11px "Public Sans", system-ui, sans-serif';
		ctx.textBaseline = 'middle';

		// Hour grid
		for (let h = Math.ceil(OPEN / 60); h * 60 <= end; h++) {
			const hx = x(h * 60);
			ctx.fillStyle = t.furniture;
			ctx.fillRect(Math.round(hx), AXIS_HEIGHT - 4, 1, bottom - AXIS_HEIGHT + 4);
			const step = narrow ? 4 : 2;
			if (h % step === 0) {
				ctx.fillStyle = t.label;
				ctx.textAlign = 'center';
				const hour = h % 24;
				ctx.fillText(hour === 0 ? '12a' : hour === 12 ? '12p' : hour > 12 ? `${hour - 12}p` : `${hour}a`, hx, AXIS_HEIGHT / 2);
			}
		}

		// Trucks waiting in the yard, in 10-minute bins
		ctx.fillStyle = t['label-strong'];
		ctx.textAlign = 'left';
		ctx.fillText(narrow ? 'Yard' : 'Yard queue', 4, AXIS_HEIGHT + YARD_ROW_HEIGHT / 2);
		const counts: number[] = [];
		for (let start = OPEN; start < Math.min(sim.now, end); start += BIN) {
			const mid = start + BIN / 2;
			counts.push(
				sim.trucks.filter((tr) => tr.tArrived !== null && tr.tArrived <= mid && (tr.tDockStart === null || tr.tDockStart > mid))
					.length,
			);
		}
		const peak = Math.max(4, ...counts);
		counts.forEach((count, i) => {
			if (!count) return;
			const h = (count / peak) * (YARD_ROW_HEIGHT - 8);
			const bx = x(OPEN + i * BIN);
			ctx.fillStyle = withAlpha(count >= 4 ? t.bad : count >= 2 ? t.warn : t.label, 0.7);
			ctx.fillRect(bx, AXIS_HEIGHT + YARD_ROW_HEIGHT - 4 - h, Math.max(1, x(OPEN + BIN) - x(OPEN) - 1), h);
		});

		// Door rows
		rows.forEach((row, i) => {
			const top = rowsTop + i * ROW_HEIGHT;
			ctx.fillStyle = t['label-strong'];
			ctx.textAlign = 'left';
			ctx.fillText(narrow ? row.label.replace('Door ', '') : row.label, 4, top + ROW_HEIGHT / 2);
			ctx.fillStyle = t.furniture;
			ctx.fillRect(gutter, top + ROW_HEIGHT - 1, this.width - gutter - 8, 1);

			for (const truck of sim.trucks) {
				if (truck.kind !== row.kind || truck.door !== row.door || truck.tDockStart === null) continue;
				const start = truck.tDockStart;
				const stop = truck.tDeparted ?? sim.now;
				const sx = x(start);
				const sw = Math.max(1, x(stop) - sx - 1);
				ctx.fillStyle = row.kind === 'inbound' ? t['truck-in'] : t['truck-out'];
				ctx.fillRect(sx, top + 4, sw, ROW_HEIGHT - 9);
				// Time beyond free time is billed as detention.
				const detentionFrom = Math.max(start, truck.tArrived! + FREE_TIME);
				if (stop > detentionFrom) {
					ctx.fillStyle = t.bad;
					ctx.fillRect(x(detentionFrom), top + 4, Math.max(1, x(stop) - x(detentionFrom) - 1), ROW_HEIGHT - 9);
				}
			}
		});

		const nx = x(sim.now);
		ctx.fillStyle = t['label-strong'];
		ctx.fillRect(Math.round(nx) - 1, AXIS_HEIGHT - 4, 2, bottom - AXIS_HEIGHT + 4);
	}
}
