/** Colors are CSS custom properties on the twin's root element, so they follow the site theme. */
export const THEME_TOKENS = [
	'bg',
	'floor',
	'floor-alt',
	'corridor',
	'room',
	'wall',
	'furniture',
	'furniture-strong',
	'label',
	'label-strong',
	'ok',
	'warn',
	'bad',
	'seen',
	'provider',
	'assistant',
	'clerk',
	'away',
	'rooming',
	'ready',
	'visit',
	'cleaning',
	'outline',
	// Cold chain
	'asphalt',
	'lane',
	'cold',
	'mild',
	'precool',
	'hold',
	'truck',
	'truck-in',
	'truck-out',
	'forklift',
] as const;

export type ThemeToken = (typeof THEME_TOKENS)[number];
export type Theme = Record<ThemeToken, string>;

export function readTheme(el: Element): Theme {
	const style = getComputedStyle(el);
	return Object.fromEntries(
		THEME_TOKENS.map((token) => [token, style.getPropertyValue(`--twin-${token}`).trim() || '#888']),
	) as Theme;
}

/** Call `onChange` whenever the site theme toggles. Returns a disconnect function. */
export function watchTheme(onChange: () => void): () => void {
	const observer = new MutationObserver(onChange);
	observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
	return () => observer.disconnect();
}

/**
 * Keep a canvas's backing store matched to its CSS size and device pixel ratio.
 * `onResize` receives the CSS pixel size.
 */
export function fitCanvas(canvas: HTMLCanvasElement, onResize: (width: number, height: number) => void): () => void {
	const apply = () => {
		const rect = canvas.getBoundingClientRect();
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = Math.max(1, Math.round(rect.width * dpr));
		canvas.height = Math.max(1, Math.round(rect.height * dpr));
		onResize(rect.width, rect.height);
	};
	const observer = new ResizeObserver(apply);
	observer.observe(canvas);
	apply();
	return () => observer.disconnect();
}

export function withAlpha(color: string, alpha: number): string {
	const hex = color.trim();
	if (/^#[0-9a-f]{6}$/i.test(hex)) {
		const n = parseInt(hex.slice(1), 16);
		return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
	}
	return color;
}

/**
 * Top-down person: shoulders as an ellipse across the direction of travel, head on top.
 * Coordinates and sizes are in world units; the context is already scaled.
 */
export function drawPerson(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	heading: number,
	fill: string,
	outline: string,
	scale = 1,
): void {
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(heading);
	ctx.beginPath();
	ctx.ellipse(-0.02 * scale, 0, 0.24 * scale, 0.42 * scale, 0, 0, Math.PI * 2);
	ctx.fillStyle = fill;
	ctx.fill();
	ctx.lineWidth = 0.06;
	ctx.strokeStyle = outline;
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(0.05 * scale, 0, 0.19 * scale, 0, Math.PI * 2);
	ctx.fillStyle = fill;
	ctx.fill();
	ctx.stroke();
	ctx.restore();
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
	ctx.beginPath();
	ctx.roundRect(x, y, w, h, r);
}
