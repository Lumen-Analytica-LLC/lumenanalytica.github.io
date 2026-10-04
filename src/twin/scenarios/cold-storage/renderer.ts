import { fitCanvas, readTheme, roundRect, type Theme, withAlpha } from '../../render/canvas';
import {
	BAYS,
	DOCK,
	DOCK_WALL_Y,
	DOOR_WIDTH,
	HOLD_SLOTS,
	inboundDoorX,
	MAX_INBOUND_DOORS,
	OUTBOUND_DOORS,
	outboundDoorX,
	PARKING,
	pathLength,
	type Point,
	pointAlong,
	PRECOOL_SLOTS,
	RACK_LEVELS,
	ROOM_WALL_Y,
	ROOMS,
	roomDoorX,
	stagingSpot,
	truckAtDoor,
	WORLD,
	YARD,
	YARD_LANE_Y,
} from './layout';
import { type ColdStorageSim, EXCURSION_MINUTES, FREE_TIME, type Pallet, type Truck } from './model';

const VIEW = { x: -1, y: -0.6, w: WORLD.width + 2, h: WORLD.height + 1.2 };
const QUEUE_SPACING = 7.6;
const VISIBLE_QUEUE = 8;
const GATE: Point = { x: -9, y: YARD_LANE_Y };
const EXIT: Point = { x: WORLD.width + 9, y: YARD_LANE_Y };
const NORTH = -Math.PI / 2;

interface TruckSprite {
	x: number;
	y: number;
	heading: number;
	path: Point[];
	goal: Point | null;
}

export interface FrameOptions {
	dt: number;
	speed: number;
	snap: boolean;
}

export class ColdStorageRenderer {
	private readonly ctx: CanvasRenderingContext2D;
	private theme: Theme;
	private scale = 1;
	private dpr = 1;
	private base: HTMLCanvasElement | null = null;
	private baseKey = '';
	private trucks = new Map<number, TruckSprite>();
	private forkliftHeadings = new Map<number, number>();
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

	reset(): void {
		this.trucks.clear();
	}

	destroy(): void {
		this.stopFit();
	}

	frame(sim: ColdStorageSim, options: FrameOptions): void {
		this.moveTrucks(sim, options);
		this.draw(sim);
	}

	// ---------------------------------------------------------------- trucks

	private truckTarget(sim: ColdStorageSim, truck: Truck): Point | null {
		switch (truck.phase) {
			case 'expected':
				return null;
			case 'yard': {
				const k = sim.yard.indexOf(truck.id);
				// Trucks beyond the visible queue wait outside the gate.
				return k < VISIBLE_QUEUE ? { x: 4 + (VISIBLE_QUEUE - 1 - k) * QUEUE_SPACING, y: YARD_LANE_Y } : GATE;
			}
			case 'docking':
			case 'at-door':
			case 'leaving':
				return truckAtDoor(doorX(truck));
			case 'gone':
				return EXIT;
		}
	}

	private moveTrucks(sim: ColdStorageSim, { dt, speed, snap }: FrameOptions): void {
		const drive = 16 * Math.min(2.5, Math.max(0.6, Math.sqrt(speed / 8)));
		for (const truck of sim.trucks) {
			const target = this.truckTarget(sim, truck);
			let sprite = this.trucks.get(truck.id);
			if (!target) continue;
			if (!sprite) {
				if (truck.phase === 'gone') continue;
				const start = snap ? target : GATE;
				sprite = { x: start.x, y: start.y, heading: snap && truck.phase !== 'yard' ? NORTH : 0, path: [], goal: null };
				this.trucks.set(truck.id, sprite);
			}
			if (!sprite.goal || sprite.goal.x !== target.x || sprite.goal.y !== target.y) {
				sprite.goal = target;
				sprite.path = this.truckRoute(sprite, target);
			}
			if (snap) {
				sprite.x = target.x;
				sprite.y = target.y;
				sprite.path = [];
				if (truck.phase !== 'yard') sprite.heading = NORTH;
			} else {
				this.stepTruck(sprite, drive * dt);
			}
			if (truck.phase === 'gone' && !sprite.path.length) this.trucks.delete(truck.id);
		}
	}

	/** Trucks drive the yard lane, then back straight into a door (or pull straight out). */
	private truckRoute(sprite: TruckSprite, target: Point): Point[] {
		const atDoor = sprite.y > YARD_LANE_Y + 0.5;
		const toDoor = target.y > YARD_LANE_Y + 0.5;
		const path: Point[] = [];
		if (atDoor) path.push({ x: sprite.x, y: YARD_LANE_Y });
		if (toDoor) path.push({ x: target.x, y: YARD_LANE_Y });
		path.push(target);
		return path;
	}

	private stepTruck(sprite: TruckSprite, distance: number): void {
		let remaining = distance;
		while (remaining > 0 && sprite.path.length) {
			const next = sprite.path[0];
			const dx = next.x - sprite.x;
			const dy = next.y - sprite.y;
			const d = Math.hypot(dx, dy);
			// Vertical moves are backing in or pulling out: the cab always faces the yard.
			if (d > 0.001) sprite.heading = Math.abs(dy) > Math.abs(dx) ? NORTH : Math.atan2(dy, dx);
			if (d <= remaining) {
				sprite.x = next.x;
				sprite.y = next.y;
				sprite.path.shift();
				remaining -= d;
			} else {
				sprite.x += (dx / d) * remaining;
				sprite.y += (dy / d) * remaining;
				remaining = 0;
			}
		}
	}

	// ---------------------------------------------------------------- drawing

	private draw(sim: ColdStorageSim): void {
		const { ctx, canvas } = this;
		const key = `${sim.inboundDoors.length}-${sim.precool.length}`;
		if (!this.base || this.baseKey !== key) this.buildBase(sim);

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(this.base!, 0, 0);
		const k = this.scale * this.dpr;
		ctx.setTransform(k, 0, 0, k, -VIEW.x * k, -VIEW.y * k);

		this.drawInventory(sim);
		this.drawStaging(sim);
		this.drawTrucks(sim);
		this.drawForklifts(sim);
		this.drawOverlays(sim);
	}

	private drawInventory(sim: ColdStorageSim): void {
		const { ctx, theme: t } = this;
		for (const zone of ['cooler', 'mild'] as const) {
			const color = zone === 'cooler' ? t.cold : t.mild;
			sim.bays[zone].forEach((bay, i) => {
				if (!bay.length) return;
				const spot = BAYS[zone][i];
				ctx.fillStyle = withAlpha(color, 0.25 + (0.6 * bay.length) / RACK_LEVELS);
				ctx.fillRect(spot.x - 0.48, spot.y - 0.48, 0.96, 0.96);
			});
		}
		sim.precool.forEach((id, i) => {
			if (id === null) return;
			const pallet = sim.pallets[id];
			this.pallet(PRECOOL_SLOTS[i], pallet.precooled ? (pallet.zone === 'cooler' ? t.cold : t.mild) : t.precool);
		});
		sim.hold.forEach((id, i) => {
			if (id === null) return;
			const pallet = sim.pallets[id];
			const released = sim.trucks[pallet.truck!].inspected;
			this.pallet(HOLD_SLOTS[i], released ? (pallet.zone === 'cooler' ? t.cold : t.mild) : t.hold);
		});
	}

	private drawStaging(sim: ColdStorageSim): void {
		sim.staging.forEach((lane, door) => {
			lane.forEach((id, i) => {
				if (id === null || id < 0) return;
				this.pallet(stagingSpot(door, i), this.exposureColor(sim.pallets[id], sim.now));
			});
		});
	}

	private exposureColor(pallet: Pallet, now: number): string {
		const t = this.theme;
		const minutes = now - (pallet.tStaged ?? now);
		if (minutes < EXCURSION_MINUTES / 2) return t.ok;
		if (minutes < EXCURSION_MINUTES) return t.warn;
		return t.bad;
	}

	private pallet(spot: Point, color: string): void {
		const { ctx, theme: t } = this;
		roundRect(ctx, spot.x - 0.44, spot.y - 0.44, 0.88, 0.88, 0.12);
		ctx.fillStyle = color;
		ctx.fill();
		ctx.lineWidth = 0.05;
		ctx.strokeStyle = t.outline;
		ctx.stroke();
	}

	private drawTrucks(sim: ColdStorageSim): void {
		const { ctx, theme: t } = this;
		for (const [id, sprite] of this.trucks) {
			const truck = sim.trucks[id];
			const waited = truck.tArrived === null ? 0 : (truck.tDeparted ?? sim.now) - truck.tArrived;
			const status = waited < FREE_TIME / 2 ? t.ok : waited < FREE_TIME ? t.warn : t.bad;

			ctx.save();
			ctx.translate(sprite.x, sprite.y);
			ctx.rotate(sprite.heading);
			// Trailer (behind the cab), reefer unit at its front, then the tractor.
			roundRect(ctx, -3.6, -1.2, 5.6, 2.4, 0.15);
			ctx.fillStyle = t.truck;
			ctx.fill();
			ctx.lineWidth = 0.08;
			ctx.strokeStyle = t.outline;
			ctx.stroke();
			ctx.fillStyle = status;
			ctx.fillRect(-3.3, -0.25, 4.9, 0.5);
			ctx.fillStyle = t['furniture-strong'];
			ctx.fillRect(1.55, -0.9, 0.35, 1.8);
			roundRect(ctx, 2.2, -1.05, 1.4, 2.1, 0.35);
			ctx.fillStyle = truck.kind === 'inbound' ? t['truck-in'] : t['truck-out'];
			ctx.fill();
			ctx.stroke();
			ctx.restore();
		}
	}

	private drawForklifts(sim: ColdStorageSim): void {
		const { ctx, theme: t } = this;
		for (const forklift of sim.forklifts) {
			let x = forklift.at.x;
			let y = forklift.at.y;
			let heading = this.forkliftHeadings.get(forklift.id) ?? NORTH;
			let carrying: number | null = null;

			const leg = forklift.legs.find((l) => sim.now >= l.t0 && sim.now <= l.t1) ?? null;
			if (leg) {
				carrying = leg.carrying;
				if (leg.path) {
					const length = pathLength(leg.path);
					const f = leg.t1 > leg.t0 ? (sim.now - leg.t0) / (leg.t1 - leg.t0) : 1;
					const p = pointAlong(leg.path, f * length);
					x = p.x;
					y = p.y;
					heading = p.heading;
				} else {
					const prev = forklift.legs[forklift.legs.indexOf(leg) - 1];
					const end = prev?.path?.at(-1) ?? forklift.at;
					x = end.x;
					y = end.y;
				}
			}
			this.forkliftHeadings.set(forklift.id, heading);

			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(heading);
			ctx.globalAlpha = forklift.status === 'down' ? 0.45 : 1;
			// Forks point forward (+x).
			ctx.fillStyle = t['furniture-strong'];
			ctx.fillRect(0.35, -0.32, 0.75, 0.12);
			ctx.fillRect(0.35, 0.2, 0.75, 0.12);
			if (carrying !== null) {
				const pallet = sim.pallets[carrying];
				roundRect(ctx, 0.3, -0.45, 0.9, 0.9, 0.1);
				ctx.fillStyle = pallet.zone === 'cooler' ? t.cold : t.mild;
				ctx.fill();
			}
			roundRect(ctx, -0.65, -0.42, 1, 0.84, 0.15);
			ctx.fillStyle = forklift.status === 'down' ? t.away : t.forklift;
			ctx.fill();
			ctx.lineWidth = 0.06;
			ctx.strokeStyle = t.outline;
			ctx.stroke();
			ctx.fillStyle = t.outline;
			ctx.fillRect(-0.35, -0.22, 0.4, 0.44);
			ctx.restore();
		}
		ctx.globalAlpha = 1;
	}

	private drawOverlays(sim: ColdStorageSim): void {
		const { ctx, theme: t } = this;
		const hidden = Math.max(0, sim.yard.length - VISIBLE_QUEUE);
		if (hidden > 0) this.label(ctx, `+${hidden} at the gate`, 2.2, YARD_LANE_Y + 1.9, 0.6, t.bad, 'left', 600);
		const precoolUsed = sim.precool.filter((id) => id !== null).length;
		this.label(ctx, `${precoolUsed}/${sim.precool.length} pallets`, ROOMS.precool.x + 2.2, ROOM_WALL_Y + 1.35, 0.45, t.label, 'left');
		const queued = sim.inspectionQueue.length + sim.inspectorsBusy;
		if (queued) this.label(ctx, `${queued} load${queued === 1 ? '' : 's'} in inspection`, ROOMS.hold.x + 4.4, ROOM_WALL_Y + 1.35, 0.45, t.hold, 'center', 600);
	}

	/** Static parts of the facility, cached until resize, theme change, or layout change. */
	private buildBase(sim: ColdStorageSim): void {
		const base = document.createElement('canvas');
		base.width = this.canvas.width;
		base.height = this.canvas.height;
		const ctx = base.getContext('2d')!;
		const t = this.theme;
		const k = this.scale * this.dpr;
		const openDoors = sim.inboundDoors.length;

		ctx.fillStyle = t.bg;
		ctx.fillRect(0, 0, base.width, base.height);
		ctx.setTransform(k, 0, 0, k, -VIEW.x * k, -VIEW.y * k);

		// Yard
		ctx.fillStyle = t.asphalt;
		ctx.fillRect(VIEW.x, YARD.y - 0.6, VIEW.w, YARD.h + 0.6);
		ctx.strokeStyle = t.lane;
		ctx.lineWidth = 0.1;
		ctx.setLineDash([1, 0.8]);
		ctx.beginPath();
		ctx.moveTo(VIEW.x, YARD_LANE_Y + 1.5);
		ctx.lineTo(VIEW.x + VIEW.w, YARD_LANE_Y + 1.5);
		ctx.stroke();
		ctx.setLineDash([]);
		const stalls = [
			...Array.from({ length: MAX_INBOUND_DOORS }, (_, i) => inboundDoorX(i)),
			...Array.from({ length: OUTBOUND_DOORS }, (_, i) => outboundDoorX(i)),
		];
		for (const x of stalls) {
			for (const edge of [x - 1.75, x + 1.75]) {
				ctx.beginPath();
				ctx.moveTo(edge, 3.4);
				ctx.lineTo(edge, DOCK_WALL_Y);
				ctx.stroke();
			}
		}
		this.label(ctx, 'From the bridge →', 0.2, YARD_LANE_Y - 0.05, 0.5, t.label, 'left');

		// Building floors
		ctx.fillStyle = t['floor-alt'];
		ctx.fillRect(DOCK.x, DOCK.y, DOCK.w, DOCK.h);
		const tints = { precool: t.precool, hold: t.hold, cooler: t.cold, mild: t.mild } as const;
		for (const [zone, room] of Object.entries(ROOMS) as [keyof typeof ROOMS, (typeof ROOMS)[keyof typeof ROOMS]][]) {
			ctx.fillStyle = t.room;
			ctx.fillRect(room.x, room.y, room.w, room.h);
			ctx.fillStyle = withAlpha(tints[zone], 0.08);
			ctx.fillRect(room.x, room.y, room.w, room.h);
		}

		// Racks and floor positions
		ctx.strokeStyle = t.furniture;
		ctx.lineWidth = 0.06;
		for (const zone of ['cooler', 'mild'] as const) {
			for (const bay of BAYS[zone]) ctx.strokeRect(bay.x - 0.5, bay.y - 0.5, 1, 1);
		}
		PRECOOL_SLOTS.forEach((slot, i) => {
			ctx.globalAlpha = i < sim.precool.length ? 1 : 0.3;
			ctx.strokeRect(slot.x - 0.48, slot.y - 0.48, 0.96, 0.96);
		});
		ctx.globalAlpha = 1;
		for (const slot of HOLD_SLOTS) ctx.strokeRect(slot.x - 0.48, slot.y - 0.48, 0.96, 0.96);
		for (const spot of PARKING) {
			ctx.strokeRect(spot.x - 0.5, spot.y - 0.5, 1, 1);
		}

		// Pre-cool fans along the back wall
		for (let x = ROOMS.precool.x + 2.4; x < ROOMS.precool.x + ROOMS.precool.w - 0.5; x += 2.2) {
			ctx.beginPath();
			ctx.arc(x, WORLD.height - 0.55, 0.38, 0, Math.PI * 2);
			ctx.fillStyle = withAlpha(t.precool, 0.5);
			ctx.fill();
		}

		this.drawWalls(ctx, openDoors);

		// Labels
		for (const [zone, room] of Object.entries(ROOMS) as [string, (typeof ROOMS)[keyof typeof ROOMS]][]) {
			const color = tints[zone as keyof typeof tints];
			this.label(ctx, room.label, room.x + room.w / 2 + 0.6, ROOM_WALL_Y + 0.55, 0.6, t['label-strong']);
			if (zone !== 'precool' && zone !== 'hold') this.label(ctx, room.temp, room.x + room.w - 1, ROOM_WALL_Y + 0.55, 0.5, color, 'right', 600);
		}
		this.label(ctx, 'Chargers', 2.7, 14.95, 0.5, t.label);
		for (let door = 0; door < MAX_INBOUND_DOORS; door++) {
			this.label(ctx, door < openDoors ? `I${door + 1}` : '—', inboundDoorX(door), DOCK_WALL_Y + 0.45, 0.5, t.label);
		}
		for (let door = 0; door < OUTBOUND_DOORS; door++) {
			this.label(ctx, `O${door + 1}`, outboundDoorX(door), DOCK_WALL_Y + 0.45, 0.5, t.label);
		}
		this.label(ctx, 'Inbound doors', (inboundDoorX(0) + inboundDoorX(MAX_INBOUND_DOORS - 1)) / 2, 13.75, 0.55, t.label);
		this.label(ctx, 'Outbound', (outboundDoorX(0) + outboundDoorX(OUTBOUND_DOORS - 1)) / 2, 13.75, 0.55, t.label);

		this.base = base;
		this.baseKey = `${sim.inboundDoors.length}-${sim.precool.length}`;
	}

	private drawWalls(ctx: CanvasRenderingContext2D, openDoors: number): void {
		const t = this.theme;
		ctx.strokeStyle = t.wall;
		const line = (x1: number, y1: number, x2: number, y2: number) => {
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
		};
		const wallWithGaps = (y: number, gaps: { x: number; w: number }[]) => {
			let x = 0;
			for (const gap of [...gaps].sort((a, b) => a.x - b.x)) {
				line(x, y, gap.x - gap.w / 2, y);
				x = gap.x + gap.w / 2;
			}
			line(x, y, WORLD.width, y);
		};

		ctx.lineWidth = 0.3;
		line(0, DOCK_WALL_Y, 0, WORLD.height);
		line(WORLD.width, DOCK_WALL_Y, WORLD.width, WORLD.height);
		line(0, WORLD.height, WORLD.width, WORLD.height);
		wallWithGaps(DOCK_WALL_Y, [
			...Array.from({ length: openDoors }, (_, i) => ({ x: inboundDoorX(i), w: DOOR_WIDTH })),
			...Array.from({ length: OUTBOUND_DOORS }, (_, i) => ({ x: outboundDoorX(i), w: DOOR_WIDTH })),
		]);

		ctx.lineWidth = 0.16;
		wallWithGaps(
			ROOM_WALL_Y,
			(['precool', 'hold', 'cooler', 'mild'] as const).map((zone) => ({ x: roomDoorX(zone), w: 1.8 })),
		);
		for (const x of [ROOMS.hold.x, ROOMS.cooler.x, ROOMS.mild.x]) line(x, ROOM_WALL_Y, x, WORLD.height);
	}

	private label(
		ctx: CanvasRenderingContext2D,
		text: string,
		x: number,
		y: number,
		size: number,
		color: string,
		align: CanvasTextAlign = 'center',
		weight = 500,
	): void {
		if (this.scale * size < 6.5) return;
		ctx.font = `${weight} ${Math.max(9 / this.scale, size)}px "Public Sans", system-ui, sans-serif`;
		ctx.fillStyle = color;
		ctx.textAlign = align;
		ctx.textBaseline = 'middle';
		ctx.fillText(text, x, y);
	}
}

function doorX(truck: Truck): number {
	return truck.kind === 'inbound' ? inboundDoorX(truck.door!) : outboundDoorX(truck.door!);
}

