import { drawPerson, fitCanvas, readTheme, roundRect, type Theme, withAlpha } from '../../render/canvas';
import {
	ASSISTANT_SPOTS,
	CHECKIN_WINDOWS,
	CHECKOUT_WINDOW,
	CLERK_SPOTS,
	checkinQueueSpot,
	checkoutQueueSpot,
	CORRIDOR,
	DESK,
	DOORS,
	ENTRANCE,
	EXAM_HEIGHT,
	EXAM_TOP,
	EXAM_WIDTH,
	examAssistantSpot,
	examDoor,
	examProviderSpot,
	examRect,
	examTable,
	LOBBY,
	OUTSIDE,
	type Point,
	PROVIDER_DESKS,
	type Rect,
	route,
	SEATS,
	STATION,
	type Waypoint,
	WORLD,
} from './layout';
import { type ClinicSim, MAX_ROOMS, type Patient, type RoomStatus, waitStart } from './model';

const VIEW = { x: -3.2, y: -0.6, w: WORLD.width + 3.8, h: WORLD.height + 1.2 };
export const VIEW_ASPECT = VIEW.w / VIEW.h;

const UP = -Math.PI / 2;
const DOWN = Math.PI / 2;

interface Target {
	at: Waypoint;
	fill: string;
	heading?: number;
	label?: string;
	dim?: boolean;
	/** Remove the agent once it reaches its target (walking out of the building). */
	leave?: boolean;
}

interface Agent {
	x: number;
	y: number;
	area: Waypoint['area'];
	heading: number;
	goal: Waypoint | null;
	path: Waypoint[];
	lane: number;
	target: Target;
}

export interface FrameOptions {
	/** Seconds since the last frame. */
	dt: number;
	/** Simulated minutes per real second; people walk a little faster at high speeds. */
	speed: number;
	/** Jump agents straight to their targets (reduced motion, or after a rebuild). */
	snap: boolean;
}

export class ClinicRenderer {
	private readonly ctx: CanvasRenderingContext2D;
	private theme: Theme;
	private scale = 1;
	private dpr = 1;
	private base: HTMLCanvasElement | null = null;
	private baseRooms = -1;
	private agents = new Map<string, Agent>();
	private readonly stopFit: () => void;

	constructor(
		private readonly canvas: HTMLCanvasElement,
		private readonly themeRoot: Element,
	) {
		this.ctx = canvas.getContext('2d')!;
		this.theme = readTheme(themeRoot);
		this.stopFit = fitCanvas(canvas, (width) => {
			this.dpr = canvas.width / Math.max(1, width);
			this.scale = width / VIEW.w;
			this.base = null;
		});
	}

	refreshTheme(): void {
		this.theme = readTheme(this.themeRoot);
		this.base = null;
	}

	/** Forget agent positions, e.g. after the scenario is rebuilt. */
	reset(): void {
		this.agents.clear();
	}

	destroy(): void {
		this.stopFit();
	}

	frame(sim: ClinicSim, options: FrameOptions): void {
		this.moveAgents(sim, options);
		this.draw(sim);
	}

	// ---------------------------------------------------------------- agent targets

	private targets(sim: ClinicSim): Map<string, Target> {
		const t = this.theme;
		const targets = new Map<string, Target>();
		const now = sim.now;

		for (const p of sim.patients) {
			const at = this.patientSpot(sim, p);
			if (!at) continue;
			targets.set(`p${p.id}`, {
				at,
				fill: this.patientColor(p, now),
				heading: p.phase === 'waiting' && p.seat !== null ? UP : ['ready', 'visit', 'rooming'].includes(p.phase) ? Math.PI : undefined,
				leave: p.phase === 'gone',
			});
		}

		for (const provider of sim.providers) {
			const inRoom = provider.status === 'visit' && provider.room !== null;
			targets.set(`dr${provider.id}`, {
				at: inRoom
					? { ...examProviderSpot(provider.room!), area: `exam-${provider.room!}` }
					: { ...PROVIDER_DESKS[provider.id], area: 'station' },
				fill: provider.status === 'away' ? t.away : t.provider,
				heading: inRoom ? 0 : UP,
				label: provider.initials,
				dim: provider.status === 'away',
			});
		}

		for (const assistant of sim.assistants) {
			const room = assistant.room;
			targets.set(`ma${assistant.id}`, {
				at:
					room === null
						? { ...ASSISTANT_SPOTS[assistant.id], area: 'station' }
						: { ...examAssistantSpot(room), area: `exam-${room}` },
				fill: t.assistant,
				heading: room === null ? DOWN : 0,
			});
		}

		CLERK_SPOTS.forEach((spot, i) => {
			targets.set(`clerk${i}`, { at: { ...spot, area: 'lobby' }, fill: t.clerk, heading: DOWN });
		});

		return targets;
	}

	private patientSpot(sim: ClinicSim, p: Patient): Waypoint | null {
		const lobby = (point: Point): Waypoint => ({ ...point, area: 'lobby' });
		switch (p.phase) {
			case 'expected':
				return null;
			case 'queue-checkin':
				return lobby(checkinQueueSpot(sim.checkinQueue.indexOf(p.id)));
			case 'checkin':
				return lobby(CHECKIN_WINDOWS[p.desk ?? 0]);
			case 'waiting':
				return lobby(p.seat !== null ? SEATS[p.seat] : { x: 14.2, y: 7 + (p.id % 5) * 0.9 });
			case 'rooming':
			case 'ready':
			case 'visit':
				return { ...examTable(p.room!), area: `exam-${p.room!}` };
			case 'queue-checkout':
				return lobby(checkoutQueueSpot(sim.checkoutQueue.indexOf(p.id)));
			case 'checkout':
				return lobby(CHECKOUT_WINDOW);
			case 'gone':
				return lobby(OUTSIDE);
		}
	}

	private patientColor(p: Patient, now: number): string {
		const t = this.theme;
		if (p.leftWithoutBeingSeen) return t.bad;
		if (p.tSeen !== null) return t.seen;
		const waited = now - waitStart(p);
		if (waited < 15) return t.ok;
		if (waited < 30) return t.warn;
		return t.bad;
	}

	// ---------------------------------------------------------------- movement

	private moveAgents(sim: ClinicSim, { dt, speed, snap }: FrameOptions): void {
		const targets = this.targets(sim);
		const walk = 6.5 * Math.min(2.4, Math.max(0.7, Math.sqrt(speed / 6)));

		for (const [key, agent] of this.agents) {
			if (!targets.has(key)) this.agents.delete(key);
		}

		for (const [key, target] of targets) {
			let agent = this.agents.get(key);
			if (!agent) {
				// Already gone before we ever drew them (e.g. after a rebuild): nothing to show.
				if (target.leave) continue;
				const start = snap || !key.startsWith('p') ? target.at : { ...OUTSIDE, area: 'lobby' as const };
				agent = {
					x: start.x,
					y: start.y,
					area: start.area,
					heading: 0,
					goal: null,
					path: [],
					lane: ((hash(key) % 100) / 100 - 0.5) * 2.2,
					target,
				};
				this.agents.set(key, agent);
			}
			agent.target = target;

			if (!agent.goal || !samePoint(agent.goal, target.at)) {
				agent.goal = target.at;
				agent.path = this.plan(agent, target);
			}

			if (snap) {
				agent.x = target.at.x;
				agent.y = target.at.y;
				agent.area = target.at.area;
				agent.path = [];
			} else {
				this.step(agent, walk * dt);
			}

			if (!agent.path.length) {
				if (target.leave) {
					this.agents.delete(key);
					continue;
				}
				if (target.heading !== undefined) agent.heading = target.heading;
			}
		}
	}

	/** Walk the building's corridors, and use the front door when coming or going. */
	private plan(agent: Agent, target: Target): Waypoint[] {
		const doorway: Waypoint = { x: ENTRANCE.x + 1.2, y: ENTRANCE.y, area: 'lobby' };
		const from: Waypoint = { x: agent.x, y: agent.y, area: agent.area };
		if (target.leave) return [...route(from, doorway, agent.lane), target.at];
		if (agent.x < 0) return [doorway, ...route(doorway, target.at, agent.lane)];
		return route(from, target.at, agent.lane);
	}

	private step(agent: Agent, distance: number): void {
		let remaining = distance;
		while (remaining > 0 && agent.path.length) {
			const next = agent.path[0];
			const dx = next.x - agent.x;
			const dy = next.y - agent.y;
			const d = Math.hypot(dx, dy);
			if (d > 0.001) agent.heading = Math.atan2(dy, dx);
			if (d <= remaining) {
				agent.x = next.x;
				agent.y = next.y;
				agent.area = next.area;
				agent.path.shift();
				remaining -= d;
			} else {
				agent.x += (dx / d) * remaining;
				agent.y += (dy / d) * remaining;
				remaining = 0;
			}
		}
	}

	// ---------------------------------------------------------------- drawing

	private draw(sim: ClinicSim): void {
		const { ctx, canvas } = this;
		if (!this.base || this.baseRooms !== sim.rooms.length) this.buildBase(sim.rooms.length);

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(this.base!, 0, 0);

		const k = this.scale * this.dpr;
		ctx.setTransform(k, 0, 0, k, -VIEW.x * k, -VIEW.y * k);

		this.drawRoomStatus(sim);

		const t = this.theme;
		const agents = [...this.agents.values()].sort((a, b) => a.y - b.y);
		for (const agent of agents) {
			ctx.globalAlpha = agent.target.dim ? 0.45 : 1;
			drawPerson(ctx, agent.x, agent.y, agent.heading, agent.target.fill, t.outline, agent.target.label ? 1.55 : 1.4);
		}
		ctx.globalAlpha = 1;

		if (this.scale >= 9) {
			ctx.font = `600 ${this.fontSize(0.62)}px Rubik, system-ui, sans-serif`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'bottom';
			for (const agent of agents) {
				if (!agent.target.label) continue;
				const text = agent.target.dim ? `${agent.target.label} · away` : agent.target.label;
				ctx.fillStyle = agent.target.dim ? t.label : t['label-strong'];
				ctx.fillText(text, agent.x, agent.y - 0.75);
			}
		}
	}

	private drawRoomStatus(sim: ClinicSim): void {
		const { ctx, theme: t } = this;
		const tint: Record<RoomStatus, string | null> = {
			free: null,
			rooming: t.rooming,
			ready: t.ready,
			visit: t.visit,
			cleaning: t.cleaning,
		};
		for (const room of sim.rooms) {
			const rect = examRect(room.id);
			const color = tint[room.status];
			if (color) {
				ctx.fillStyle = withAlpha(color, 0.13);
				ctx.fillRect(rect.x + 0.1, rect.y + 0.1, rect.w - 0.2, rect.h - 0.2);
			}
			// Door status light, like the flag lights outside real exam rooms.
			ctx.beginPath();
			ctx.arc(rect.x + rect.w - 0.7, rect.y + 0.75, 0.32, 0, Math.PI * 2);
			ctx.fillStyle = color ?? t.furniture;
			ctx.fill();
		}
	}

	private fontSize(worldUnits: number): number {
		return Math.max(9 / this.scale, worldUnits);
	}

	/** Static floor plan, cached until resize, theme change, or room count change. */
	private buildBase(openRooms: number): void {
		const base = document.createElement('canvas');
		base.width = this.canvas.width;
		base.height = this.canvas.height;
		const ctx = base.getContext('2d')!;
		const t = this.theme;
		const k = this.scale * this.dpr;

		ctx.fillStyle = t.bg;
		ctx.fillRect(0, 0, base.width, base.height);
		ctx.setTransform(k, 0, 0, k, -VIEW.x * k, -VIEW.y * k);

		const fillRect = (r: Rect, color: string) => {
			ctx.fillStyle = color;
			ctx.fillRect(r.x, r.y, r.w, r.h);
		};

		// Floors
		fillRect(LOBBY, t.floor);
		fillRect(STATION, t['floor-alt']);
		fillRect(CORRIDOR, t.corridor);
		for (let room = 0; room < MAX_ROOMS; room++) {
			fillRect(examRect(room), room < openRooms ? t.room : t.bg);
		}

		// Entrance mat and arrow
		ctx.fillStyle = t.furniture;
		ctx.fillRect(-2.6, ENTRANCE.y - 1, 2.4, 2);
		this.label(ctx, 'Entrance', -1.4, ENTRANCE.y + 2, 0.55, t.label);

		this.drawLobbyFurniture(ctx);
		this.drawStationFurniture(ctx);
		for (let room = 0; room < MAX_ROOMS; room++) this.drawExamRoom(ctx, room, room < openRooms);

		this.drawWalls(ctx);

		// Area labels
		this.label(ctx, 'Front desk', DESK.x + DESK.w / 2, DESK.y + DESK.h / 2, 0.5, t.label);
		this.label(ctx, 'Waiting room', 22.2, 3.2, 0.7, t.label);
		this.label(ctx, 'Care team station', 39.5, 1.2, 0.7, t.label);
		this.label(ctx, 'Check-in', 5.25, 3.0, 0.45, t.label);
		this.label(ctx, 'Checkout', 12, 3.0, 0.45, t.label);

		this.base = base;
		this.baseRooms = openRooms;
	}

	private drawLobbyFurniture(ctx: CanvasRenderingContext2D): void {
		const t = this.theme;
		// Front desk counter
		roundRect(ctx, DESK.x, DESK.y, DESK.w, DESK.h, 0.2);
		ctx.fillStyle = t['furniture-strong'];
		ctx.fill();
		// Waiting room chairs
		ctx.fillStyle = t.furniture;
		for (const seat of SEATS) {
			roundRect(ctx, seat.x - 0.42, seat.y - 0.38, 0.84, 0.8, 0.18);
			ctx.fill();
		}
		// Side tables and plants
		for (const [x, y] of [
			[29.6, 4.6],
			[29.6, 10.6],
			[15, 11],
		]) {
			ctx.beginPath();
			ctx.arc(x, y, 0.55, 0, Math.PI * 2);
			ctx.fillStyle = withAlpha(t.ok, 0.35);
			ctx.fill();
		}
		// Wall-mounted TV
		ctx.fillStyle = t['furniture-strong'];
		ctx.fillRect(19, 0.15, 3.2, 0.3);
	}

	private drawStationFurniture(ctx: CanvasRenderingContext2D): void {
		const t = this.theme;
		for (const desk of PROVIDER_DESKS) {
			roundRect(ctx, desk.x - 1.05, desk.y - 1.6, 2.1, 0.9, 0.12);
			ctx.fillStyle = t['furniture-strong'];
			ctx.fill();
			ctx.fillStyle = t.furniture;
			ctx.fillRect(desk.x - 0.45, desk.y - 1.5, 0.9, 0.18);
		}
		roundRect(ctx, 32, ASSISTANT_SPOTS[0].y + 0.75, 15, 0.9, 0.2);
		ctx.fillStyle = t.furniture;
		ctx.fill();
		this.label(ctx, 'Medical assistants', 39.5, 11.4, 0.45, t.label);
	}

	private drawExamRoom(ctx: CanvasRenderingContext2D, room: number, open: boolean): void {
		const t = this.theme;
		const r = examRect(room);
		if (!open) {
			ctx.save();
			ctx.beginPath();
			ctx.rect(r.x, r.y, r.w, r.h);
			ctx.clip();
			ctx.strokeStyle = t.furniture;
			ctx.lineWidth = 0.08;
			for (let d = -r.h; d < r.w; d += 0.9) {
				ctx.beginPath();
				ctx.moveTo(r.x + d, r.y + r.h);
				ctx.lineTo(r.x + d + r.h, r.y);
				ctx.stroke();
			}
			ctx.restore();
			this.label(ctx, 'Closed', r.x + r.w / 2, r.y + r.h / 2, 0.5, t.label);
			return;
		}
		const table = examTable(room);
		roundRect(ctx, table.x - 0.55, table.y - 1.6, 1.1, 3.2, 0.25);
		ctx.fillStyle = t['furniture-strong'];
		ctx.fill();
		roundRect(ctx, table.x - 0.4, table.y - 1.5, 0.8, 0.5, 0.15);
		ctx.fillStyle = t.furniture;
		ctx.fill();
		// Counter and sink along the back wall
		ctx.fillStyle = t.furniture;
		ctx.fillRect(r.x + 0.25, r.y + r.h - 1.2, r.w - 0.5, 0.95);
		// Provider stool
		const stool = examProviderSpot(room);
		ctx.beginPath();
		ctx.arc(stool.x, stool.y, 0.35, 0, Math.PI * 2);
		ctx.fill();
		this.label(ctx, `Exam ${room + 1}`, r.x + r.w / 2 - 0.4, r.y + r.h - 1.9, 0.5, t.label);
	}

	private drawWalls(ctx: CanvasRenderingContext2D): void {
		const t = this.theme;
		const door = 1.3;
		ctx.strokeStyle = t.wall;
		ctx.lineCap = 'square';

		const line = (x1: number, y1: number, x2: number, y2: number) => {
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
		};
		/** Horizontal wall at y from x1 to x2 with gaps centred on `gaps`. */
		const wallWithGaps = (y: number, x1: number, x2: number, gaps: number[]) => {
			let x = x1;
			for (const g of [...gaps].sort((a, b) => a - b)) {
				line(x, y, g - door / 2, y);
				x = g + door / 2;
			}
			line(x, y, x2, y);
		};

		// Outer shell, with the entrance on the left
		ctx.lineWidth = 0.3;
		line(0, 0, WORLD.width, 0);
		line(WORLD.width, 0, WORLD.width, WORLD.height);
		line(0, WORLD.height, WORLD.width, WORLD.height);
		line(0, 0, 0, ENTRANCE.y - 1);
		line(0, ENTRANCE.y + 1, 0, WORLD.height);

		// Interior walls
		ctx.lineWidth = 0.16;
		wallWithGaps(12, 0, WORLD.width, [DOORS.lobby.x, DOORS.station.x]);
		line(31, 0, 31, 12);
		wallWithGaps(
			EXAM_TOP,
			0,
			WORLD.width,
			Array.from({ length: MAX_ROOMS }, (_, room) => examDoor(room).x),
		);
		for (let room = 1; room < MAX_ROOMS; room++) {
			line(room * EXAM_WIDTH, EXAM_TOP, room * EXAM_WIDTH, EXAM_TOP + EXAM_HEIGHT);
		}
	}

	private label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string) {
		if (this.scale * size < 7) return;
		ctx.font = `500 ${this.fontSize(size)}px "Public Sans", system-ui, sans-serif`;
		ctx.fillStyle = color;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(text, x, y);
	}
}

function samePoint(a: Waypoint, b: Waypoint): boolean {
	return a.area === b.area && Math.abs(a.x - b.x) < 0.01 && Math.abs(a.y - b.y) < 0.01;
}

function hash(key: string): number {
	let h = 7;
	for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
	return h;
}
