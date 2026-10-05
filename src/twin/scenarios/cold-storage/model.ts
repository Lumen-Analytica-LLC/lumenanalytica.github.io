import { lognormal, normal, type Rng, stream, uniform } from '../../engine/rng';
import { formatClock, Simulation } from '../../engine/sim';
import {
	BAYS,
	forkliftPath,
	HOLD_SLOTS,
	inboundDoorX,
	MAX_FORKLIFTS,
	MAX_INBOUND_DOORS,
	OUTBOUND_DOORS,
	outboundDoorX,
	PARKING,
	pathLength,
	type Point,
	PRECOOL_SLOTS,
	RACK_LEVELS,
	type Spot,
	STAGING_PER_DOOR,
	stagingSpot,
	type StorageZone,
	trailerSpot,
} from './layout';

// All times are minutes after midnight.
export const OPEN = 5 * 60;
const ARRIVAL_START = 5 * 60 + 30;
const ARRIVAL_END = 19 * 60;
const OUTBOUND_START = 6 * 60;
const OUTBOUND_END = 21 * 60;
export const DAY_END = 24 * 60 - 1;

/** Free time before a carrier starts billing detention, and the hourly rate. */
export const FREE_TIME = 120;
export const DETENTION_PER_HOUR = 75;
/** Minutes on an unrefrigerated dock before a pallet counts as a temperature excursion. */
export const EXCURSION_MINUTES = 30;

const FORKLIFT_SPEED = 100; // meters per minute, loaded, including turns
const PICK_MINUTES = 0.5;
const DROP_MINUTES = 0.4;
const RACK_EXTRA_MINUTES = 0.35;
const DOCKING_MINUTES = 4;
const PAPERWORK_MINUTES = 8;
const INSPECTORS = 2;
const INITIAL_FILL = 0.55;
const OUTBOUND_RATIO = 1;
const SURGE_FACTOR = 1.4;
export const FORKLIFTS_DOWN_WINDOW: [number, number] = [9 * 60, 12 * 60];
const FORKLIFTS_DOWN = 2;

export type CommodityId = 'berries' | 'leafy-greens' | 'broccoli' | 'avocados' | 'tomatoes' | 'peppers' | 'limes';

export interface Commodity {
	id: CommodityId;
	zone: StorageZone;
	precoolMinutes: number | null;
	share: number;
}

export const COMMODITIES: Commodity[] = [
	{ id: 'berries', zone: 'cooler', precoolMinutes: 90, share: 0.16 },
	{ id: 'leafy-greens', zone: 'cooler', precoolMinutes: 75, share: 0.14 },
	{ id: 'broccoli', zone: 'cooler', precoolMinutes: 80, share: 0.1 },
	{ id: 'avocados', zone: 'mild', precoolMinutes: null, share: 0.18 },
	{ id: 'tomatoes', zone: 'mild', precoolMinutes: null, share: 0.18 },
	{ id: 'peppers', zone: 'mild', precoolMinutes: null, share: 0.12 },
	{ id: 'limes', zone: 'mild', precoolMinutes: null, share: 0.12 },
];

export type ArrivalPattern = 'waves' | 'appointments';
export type Priority = 'unload-first' | 'balanced' | 'putaway-first';

export const PATTERNS: Record<ArrivalPattern, string> = {
	waves: 'Bridge waves',
	appointments: 'Appointments',
};

export const PRIORITIES: Record<Priority, string> = {
	'unload-first': 'Unload first',
	balanced: 'Balanced',
	'putaway-first': 'Put away first',
};

export interface ColdStorageConfig {
	seed: number;
	forklifts: number;
	doors: number;
	trucksPerDay: number;
	pattern: ArrivalPattern;
	priority: Priority;
	inspectionPct: number;
	precoolCapacity: number;
	surge: boolean;
	forkliftsDown: boolean;
}

export const DEFAULT_CONFIG: ColdStorageConfig = {
	seed: 1004,
	forklifts: 6,
	doors: 6,
	trucksPerDay: 36,
	pattern: 'waves',
	priority: 'unload-first',
	inspectionPct: 15,
	precoolCapacity: 48,
	surge: false,
	forkliftsDown: false,
};

export type TruckPhase = 'expected' | 'yard' | 'docking' | 'at-door' | 'leaving' | 'gone';

export interface Truck {
	id: number;
	kind: 'inbound' | 'outbound';
	arrival: number;
	appt: number | null;
	commodity: Commodity | null;
	zone: StorageZone;
	pallets: number;
	inspect: boolean;
	phase: TruckPhase;
	door: number | null;
	/** Pallets still to come off (inbound) or go on (outbound), not yet claimed by a forklift. */
	unclaimed: number;
	/** Pallets moved so far. */
	moved: number;
	tArrived: number | null;
	tDockStart: number | null;
	tDocked: number | null;
	tDeparted: number | null;
	inspected: boolean;
	warned: { warm: boolean };
}

export type PalletState = 'trailer' | 'staged' | 'carried' | 'precool' | 'hold' | 'stored' | 'shipped';

export interface Pallet {
	id: number;
	commodity: Commodity;
	zone: StorageZone;
	truck: number | null;
	state: PalletState;
	claimed: boolean;
	door: number | null;
	slot: number | null;
	tStaged: number | null;
	exposure: number | null;
	precooled: boolean;
	tStored: number;
}

export interface Leg {
	t0: number;
	t1: number;
	/** Travel path, or null while picking or dropping in place. */
	path: Point[] | null;
	carrying: number | null;
}

export interface Forklift {
	id: number;
	status: 'idle' | 'busy' | 'down';
	at: Spot;
	legs: Leg[];
	busyMinutes: number;
	downMinutes: number;
	downRequested: boolean;
	downSince: number | null;
}

export type HoldingArea = 'precool' | 'hold' | StorageZone;

/** Something worth telling the viewer. Worded per language by the page, not here. */
export type ColdStorageEvent =
	| { kind: 'open' }
	| { kind: 'detention'; truck: number; door: string | null }
	| { kind: 'inspection-flagged'; truck: number; commodity: CommodityId }
	| { kind: 'inspection-released'; truck: number; commodity: CommodityId }
	| { kind: 'warm-pallets'; truck: number; commodity: CommodityId }
	| { kind: 'area-full'; area: HoldingArea }
	| { kind: 'forklifts-down'; count: number }
	| { kind: 'forklifts-back' }
	| { kind: 'day-complete' };

export interface LogEntry {
	time: number;
	event: ColdStorageEvent;
	tone: 'info' | 'warn' | 'bad' | 'good';
}

export interface ColdStorageMetrics {
	avgTurn: number | null;
	detentionCost: number;
	inYard: number;
	excursions: number;
	received: number;
	avgDockDwell: number | null;
	utilization: number | null;
	trucksDone: number;
	trucksTotal: number;
	finish: number | null;
	dayComplete: boolean;
}

interface Task {
	kind: 'unload' | 'putaway' | 'transfer' | 'load';
	rank: number;
	urgency: number;
	pickup: Spot;
	pallet?: Pallet;
	truck?: Truck;
	stagingIndex?: number;
	dest?: { area: 'precool' | 'hold' | StorageZone; index: number };
}

export class ColdStorageSim {
	readonly config: ColdStorageConfig;
	readonly sim = new Simulation(OPEN);
	readonly trucks: Truck[] = [];
	readonly pallets: Pallet[] = [];
	readonly forklifts: Forklift[];
	readonly inboundDoors: (number | null)[];
	readonly outboundDoors: (number | null)[] = Array(OUTBOUND_DOORS).fill(null);
	readonly staging: (number | null)[][];
	readonly precool: (number | null)[];
	readonly hold: (number | null)[] = Array(HOLD_SLOTS.length).fill(null);
	readonly bays: Record<StorageZone, number[][]> = {
		cooler: BAYS.cooler.map(() => []),
		mild: BAYS.mild.map(() => []),
	};
	readonly yard: number[] = [];
	readonly inspectionQueue: number[] = [];
	inspectorsBusy = 0;
	readonly log: LogEntry[] = [];
	/** Pallets currently on the dock, in pre-cool, or in the hold, so task search stays fast. */
	private readonly staged = new Set<number>();
	private readonly inRooms = new Set<number>();
	private readonly reserved = {
		precool: new Set<number>(),
		hold: new Set<number>(),
		cooler: new Map<number, number>(),
		mild: new Map<number, number>(),
	};
	private warnedFull = { precool: false, hold: false, cooler: false, mild: false };
	private lastActivity = OPEN;

	constructor(config: ColdStorageConfig) {
		this.config = config;
		this.inboundDoors = Array(Math.min(config.doors, MAX_INBOUND_DOORS)).fill(null);
		this.staging = this.inboundDoors.map(() => Array(STAGING_PER_DOOR).fill(null));
		this.precool = Array(Math.min(config.precoolCapacity, PRECOOL_SLOTS.length)).fill(null);
		this.forklifts = Array.from({ length: Math.min(config.forklifts, MAX_FORKLIFTS) }, (_, id) => ({
			id,
			status: 'idle',
			at: PARKING[id],
			legs: [],
			busyMinutes: 0,
			downMinutes: 0,
			downRequested: false,
			downSince: null,
		}));

		this.seedInventory();
		this.generateTrucks();
		for (const truck of this.trucks) this.sim.at(truck.arrival, () => this.arrive(truck));

		if (config.forkliftsDown) {
			const [start, end] = FORKLIFTS_DOWN_WINDOW;
			this.sim.at(start, () => this.forkliftsDown(true));
			this.sim.at(end, () => this.forkliftsDown(false));
		}
		this.note(OPEN, { kind: 'open' }, 'info');
	}

	get now(): number {
		return this.sim.now;
	}

	advance(to: number): void {
		this.sim.runUntil(Math.min(to, DAY_END));
	}

	// ---------------------------------------------------------------- generation

	private seedInventory(): void {
		const rng = stream(this.config.seed, 'inventory');
		for (const zone of ['cooler', 'mild'] as const) {
			const commodities = COMMODITIES.filter((c) => c.zone === zone);
			BAYS[zone].forEach((_, bay) => {
				const count = rng() < INITIAL_FILL * 1.3 ? Math.ceil(rng() * RACK_LEVELS) : 0;
				for (let level = 0; level < count; level++) {
					const pallet = this.newPallet(pick(rng, commodities), null, 'stored');
					pallet.precooled = true;
					pallet.slot = bay;
					pallet.tStored = OPEN - uniform(rng, 60, 24 * 60);
					this.bays[zone][bay].push(pallet.id);
				}
			});
		}
	}

	private generateTrucks(): void {
		const { seed, trucksPerDay, pattern, surge, inspectionPct } = this.config;
		const inbound = Math.round(trucksPerDay * (surge ? SURGE_FACTOR : 1));
		const window = ARRIVAL_END - ARRIVAL_START;

		// One stream per truck: the same truck keeps its load whatever else changes.
		for (let i = 0; i < inbound; i++) {
			const rng = stream(seed, `inbound-${i}`);
			const u = rng();
			const commodity = pickWeighted(rng, COMMODITIES);
			const pallets = Math.round(uniform(rng, 18, 26));
			const inspect = rng() < inspectionPct / 100;
			const jitter = normal(rng, 0, 10);
			const arrival =
				pattern === 'waves'
					? waveQuantile(u)
					: ARRIVAL_START + ((i + 0.5) / inbound) * window + jitter;
			this.addTruck('inbound', clampTime(arrival), null, commodity, commodity.zone, pallets, inspect);
		}

		const outbound = Math.round(inbound * OUTBOUND_RATIO);
		for (let i = 0; i < outbound; i++) {
			const rng = stream(seed, `outbound-${i}`);
			const appt = OUTBOUND_START + ((i + 0.5) / outbound) * (OUTBOUND_END - OUTBOUND_START);
			const zone: StorageZone = rng() < 0.4 ? 'cooler' : 'mild';
			const pallets = Math.round(uniform(rng, 18, 26));
			const arrival = appt + normal(rng, -10, 20);
			this.addTruck('outbound', Math.max(OPEN, arrival), appt, null, zone, pallets, false);
		}
	}

	private addTruck(
		kind: Truck['kind'],
		arrival: number,
		appt: number | null,
		commodity: Commodity | null,
		zone: StorageZone,
		pallets: number,
		inspect: boolean,
	): void {
		const truck: Truck = {
			id: this.trucks.length,
			kind,
			arrival,
			appt,
			commodity,
			zone,
			pallets,
			inspect,
			phase: 'expected',
			door: null,
			unclaimed: pallets,
			moved: 0,
			tArrived: null,
			tDockStart: null,
			tDocked: null,
			tDeparted: null,
			inspected: false,
			warned: { warm: false },
		};
		this.trucks.push(truck);
		if (kind === 'inbound') {
			for (let i = 0; i < pallets; i++) this.newPallet(commodity!, truck.id, 'trailer');
		}
	}

	private newPallet(commodity: Commodity, truck: number | null, state: PalletState): Pallet {
		const pallet: Pallet = {
			id: this.pallets.length,
			commodity,
			zone: commodity.zone,
			truck,
			state,
			claimed: false,
			door: null,
			slot: null,
			tStaged: null,
			exposure: null,
			precooled: commodity.precoolMinutes === null,
			tStored: 0,
		};
		this.pallets.push(pallet);
		return pallet;
	}

	// ---------------------------------------------------------------- trucks

	private arrive(truck: Truck): void {
		truck.phase = 'yard';
		truck.tArrived = this.now;
		this.yard.push(truck.id);
		this.sim.after(FREE_TIME, () => {
			if (truck.phase === 'gone') return;
			const door = truck.phase === 'yard' ? null : doorLabel(truck);
			this.note(this.now, { kind: 'detention', truck: truck.id + 1, door }, 'bad');
		});
		if (truck.inspect) {
			this.note(this.now, { kind: 'inspection-flagged', truck: truck.id + 1, commodity: truck.commodity!.id }, 'warn');
		}
		this.dispatch();
	}

	private assignDoors(): void {
		for (const id of [...this.yard]) {
			const truck = this.trucks[id];
			const doors = truck.kind === 'inbound' ? this.inboundDoors : this.outboundDoors;
			const door = doors.indexOf(null);
			if (door < 0) continue;
			doors[door] = truck.id;
			truck.door = door;
			truck.phase = 'docking';
			truck.tDockStart = this.now;
			this.yard.splice(this.yard.indexOf(id), 1);
			this.sim.after(DOCKING_MINUTES, () => {
				truck.phase = 'at-door';
				truck.tDocked = this.now;
				// Inspectors sample the load at the door; pallets wait in the hold until it's released.
				if (truck.inspect) this.inspectionQueue.push(truck.id);
				this.dispatch();
			});
		}
	}

	private finishTruck(truck: Truck): void {
		truck.phase = 'leaving';
		this.sim.after(PAPERWORK_MINUTES, () => {
			truck.phase = 'gone';
			truck.tDeparted = this.now;
			this.lastActivity = Math.max(this.lastActivity, this.now);
			const doors = truck.kind === 'inbound' ? this.inboundDoors : this.outboundDoors;
			doors[truck.door!] = null;
			if (this.dayComplete()) this.note(this.now, { kind: 'day-complete' }, 'good');
			this.dispatch();
		});
	}

	// ---------------------------------------------------------------- forklift work

	private dispatch(): void {
		this.assignDoors();
		this.startInspections();
		for (const forklift of this.forklifts) {
			if (forklift.status !== 'idle') continue;
			if (forklift.downRequested) {
				this.parkForklift(forklift);
				continue;
			}
			const task = this.bestTask(forklift);
			if (task) this.startTask(forklift, task);
		}
	}

	private tasks(): Task[] {
		const tasks: Task[] = [];
		const order = PRIORITY_RANKS[this.config.priority];
		const now = this.now;

		// Unload: next pallet off a docked inbound truck, if its staging lane has room.
		for (const truck of this.trucks) {
			if (truck.kind !== 'inbound' || truck.phase !== 'at-door' || truck.unclaimed <= 0) continue;
			const stagingIndex = this.staging[truck.door!].indexOf(null);
			if (stagingIndex < 0) continue;
			tasks.push({
				kind: 'unload',
				rank: order.unload,
				urgency: now - truck.tArrived!,
				pickup: trailerSpot(inboundDoorX(truck.door!)),
				truck,
				stagingIndex,
			});
		}

		// Put away: staged pallets to hold, pre-cool or storage.
		for (const id of this.staged) {
			const pallet = this.pallets[id];
			if (pallet.claimed) continue;
			const dest = this.destinationFor(pallet);
			if (!dest) continue;
			tasks.push({
				kind: 'putaway',
				rank: order.putaway,
				urgency: (now - pallet.tStaged!) * 3,
				pickup: stagingSpot(pallet.door!, pallet.slot!),
				pallet,
				dest,
			});
		}

		// Transfers: pre-cooled pallets to the cooler, released holds onwards.
		for (const id of this.inRooms) {
			const pallet = this.pallets[id];
			if (pallet.claimed) continue;
			const ready =
				(pallet.state === 'precool' && pallet.precooled) ||
				(pallet.state === 'hold' && this.trucks[pallet.truck!].inspected);
			if (!ready) continue;
			const dest = this.destinationFor(pallet);
			if (!dest) continue;
			tasks.push({
				kind: 'transfer',
				rank: order.transfer,
				urgency: 20,
				pickup: pallet.state === 'precool' ? PRECOOL_SLOTS[pallet.slot!] : HOLD_SLOTS[pallet.slot!],
				pallet,
				dest,
			});
		}

		// Load: oldest stored pallet of the right zone onto a docked outbound truck.
		const oldest = new Map<StorageZone, Pallet | null>();
		for (const truck of this.trucks) {
			if (truck.kind !== 'outbound' || truck.phase !== 'at-door' || truck.unclaimed <= 0) continue;
			if (!oldest.has(truck.zone)) oldest.set(truck.zone, this.oldestStored(truck.zone));
			const pallet = oldest.get(truck.zone);
			if (!pallet) continue;
			tasks.push({
				kind: 'load',
				rank: order.load,
				urgency: now - Math.min(truck.appt!, truck.tArrived!) + 10,
				pickup: BAYS[truck.zone][pallet.slot!],
				pallet,
				truck,
			});
		}
		return tasks;
	}

	private bestTask(forklift: Forklift): Task | null {
		let best: Task | null = null;
		let bestScore = -Infinity;
		for (const task of this.tasks()) {
			const distance = Math.hypot(task.pickup.x - forklift.at.x, task.pickup.y - forklift.at.y);
			// Rank dominates; within a rank, the most urgent; distance breaks near-ties.
			const urgency = this.config.priority === 'balanced' ? task.urgency : task.urgency * 0.25;
			const score = -task.rank * 10_000 + urgency - distance * 0.5;
			if (score > bestScore) {
				best = task;
				bestScore = score;
			}
		}
		return best;
	}

	private startTask(forklift: Forklift, task: Task): void {
		let pallet: Pallet;
		let drop: Spot;

		if (task.kind === 'unload') {
			const truck = task.truck!;
			truck.unclaimed--;
			pallet = this.pallets.find((p) => p.truck === truck.id && p.state === 'trailer' && !p.claimed)!;
			this.staging[truck.door!][task.stagingIndex!] = -1; // reserved
			drop = stagingSpot(truck.door!, task.stagingIndex!);
		} else if (task.kind === 'load') {
			const truck = task.truck!;
			truck.unclaimed--;
			pallet = task.pallet!;
			drop = trailerSpot(outboundDoorX(truck.door!));
		} else {
			pallet = task.pallet!;
			drop = this.reserve(task.dest!);
		}
		pallet.claimed = true;

		const toPickup = forkliftPath(forklift.at, task.pickup);
		const toDrop = forkliftPath(task.pickup, drop);
		const pickMinutes = PICK_MINUTES + (task.pickup.laneY !== undefined && task.kind === 'load' ? RACK_EXTRA_MINUTES : 0);
		const dropMinutes = DROP_MINUTES + (task.dest && task.dest.area !== 'precool' && task.dest.area !== 'hold' ? RACK_EXTRA_MINUTES : 0);

		const t0 = this.now;
		const t1 = t0 + pathLength(toPickup) / FORKLIFT_SPEED;
		const t2 = t1 + pickMinutes;
		const t3 = t2 + pathLength(toDrop) / FORKLIFT_SPEED;
		const t4 = t3 + dropMinutes;
		forklift.status = 'busy';
		forklift.legs = [
			{ t0, t1, path: toPickup, carrying: null },
			{ t0: t1, t1: t2, path: null, carrying: pallet.id },
			{ t0: t2, t1: t3, path: toDrop, carrying: pallet.id },
			{ t0: t3, t1: t4, path: null, carrying: pallet.id },
		];
		forklift.busyMinutes += t4 - t0;

		this.sim.at(t2, () => this.pickUp(task, pallet));
		this.sim.at(t4, () => {
			this.dropOff(task, pallet);
			forklift.at = drop;
			forklift.legs = [];
			forklift.status = 'idle';
			this.lastActivity = Math.max(this.lastActivity, this.now);
			this.dispatch();
		});
	}

	private pickUp(task: Task, pallet: Pallet): void {
		this.staged.delete(pallet.id);
		this.inRooms.delete(pallet.id);
		if (pallet.state === 'staged') {
			this.staging[pallet.door!][pallet.slot!] = null;
			pallet.exposure = this.now - pallet.tStaged!;
		} else if (pallet.state === 'precool') {
			this.precool[pallet.slot!] = null;
		} else if (pallet.state === 'hold') {
			this.hold[pallet.slot!] = null;
		} else if (pallet.state === 'stored') {
			const bay = this.bays[pallet.zone][pallet.slot!];
			bay.splice(bay.indexOf(pallet.id), 1);
		}
		pallet.state = 'carried';
		pallet.slot = null;
		this.dispatch();
	}

	private dropOff(task: Task, pallet: Pallet): void {
		pallet.claimed = false;
		if (task.kind === 'unload') {
			const truck = task.truck!;
			pallet.state = 'staged';
			pallet.door = truck.door;
			pallet.slot = task.stagingIndex!;
			pallet.tStaged = this.now;
			this.staging[truck.door!][task.stagingIndex!] = pallet.id;
			this.staged.add(pallet.id);
			const stagedAt = this.now;
			this.sim.after(EXCURSION_MINUTES, () => {
				if (pallet.state !== 'staged' || pallet.tStaged !== stagedAt || truck.warned.warm) return;
				truck.warned.warm = true;
				this.note(this.now, { kind: 'warm-pallets', truck: truck.id + 1, commodity: pallet.commodity.id }, 'warn');
			});
			truck.moved++;
			if (truck.moved === truck.pallets) this.finishTruck(truck);
			return;
		}
		if (task.kind === 'load') {
			const truck = task.truck!;
			pallet.state = 'shipped';
			truck.moved++;
			if (truck.moved === truck.pallets) this.finishTruck(truck);
			return;
		}

		const dest = task.dest!;
		pallet.slot = dest.index;
		if (dest.area === 'precool') {
			this.reserved.precool.delete(dest.index);
			this.precool[dest.index] = pallet.id;
			this.inRooms.add(pallet.id);
			pallet.state = 'precool';
			const minutes = pallet.commodity.precoolMinutes! * lognormal(stream(this.config.seed, `pc-${pallet.id}`), 1, 0.15);
			this.sim.after(minutes, () => {
				pallet.precooled = true;
				this.dispatch();
			});
		} else if (dest.area === 'hold') {
			this.reserved.hold.delete(dest.index);
			this.hold[dest.index] = pallet.id;
			this.inRooms.add(pallet.id);
			pallet.state = 'hold';
		} else {
			const reserved = this.reserved[dest.area];
			const count = (reserved.get(dest.index) ?? 1) - 1;
			if (count > 0) reserved.set(dest.index, count);
			else reserved.delete(dest.index);
			this.bays[dest.area][dest.index].push(pallet.id);
			pallet.state = 'stored';
			pallet.tStored = this.now;
		}
	}

	/** Where a pallet should go next, if there's room. */
	private destinationFor(pallet: Pallet): Task['dest'] | null {
		const truck = pallet.truck === null ? null : this.trucks[pallet.truck];
		if (pallet.state === 'staged' && truck?.inspect && !truck.inspected) {
			const index = this.freeSlot(this.hold, this.reserved.hold);
			return index === null ? this.full('hold') : { area: 'hold', index };
		}
		if (!pallet.precooled && pallet.state !== 'precool') {
			const index = this.freeSlot(this.precool, this.reserved.precool);
			return index === null ? this.full('precool') : { area: 'precool', index };
		}
		const index = this.freeBay(pallet.zone);
		return index === null ? this.full(pallet.zone) : { area: pallet.zone, index };
	}

	private reserve(dest: NonNullable<Task['dest']>): Spot {
		if (dest.area === 'precool') {
			this.reserved.precool.add(dest.index);
			return PRECOOL_SLOTS[dest.index];
		}
		if (dest.area === 'hold') {
			this.reserved.hold.add(dest.index);
			return HOLD_SLOTS[dest.index];
		}
		const reserved = this.reserved[dest.area];
		reserved.set(dest.index, (reserved.get(dest.index) ?? 0) + 1);
		return BAYS[dest.area][dest.index];
	}

	private freeSlot(slots: (number | null)[], reserved: Set<number>): number | null {
		for (let i = 0; i < slots.length; i++) if (slots[i] === null && !reserved.has(i)) return i;
		return null;
	}

	/** Fill bays nearest the room door first, the way drivers actually work. */
	private freeBay(zone: StorageZone): number | null {
		const bays = this.bays[zone];
		const reserved = this.reserved[zone];
		for (let i = 0; i < bays.length; i++) {
			if (bays[i].length + (reserved.get(i) ?? 0) < RACK_LEVELS) return i;
		}
		return null;
	}

	private full(area: HoldingArea): null {
		if (!this.warnedFull[area]) {
			this.warnedFull[area] = true;
			this.note(this.now, { kind: 'area-full', area }, 'bad');
		}
		return null;
	}

	private oldestStored(zone: StorageZone): Pallet | null {
		let best: Pallet | null = null;
		for (const bay of this.bays[zone]) {
			for (const id of bay) {
				const pallet = this.pallets[id];
				if (!pallet.claimed && (!best || pallet.tStored < best.tStored)) best = pallet;
			}
		}
		return best;
	}

	private parkForklift(forklift: Forklift): void {
		const spot = PARKING[forklift.id];
		const path = forkliftPath(forklift.at, spot);
		const t1 = this.now + pathLength(path) / FORKLIFT_SPEED;
		forklift.status = 'down';
		forklift.downSince = t1;
		forklift.legs = [{ t0: this.now, t1, path, carrying: null }];
		this.sim.at(t1, () => {
			if (forklift.status !== 'down') return;
			forklift.at = spot;
			forklift.legs = [];
		});
	}

	private forkliftsDown(down: boolean): void {
		const affected = this.forklifts.slice(0, FORKLIFTS_DOWN);
		for (const forklift of affected) {
			forklift.downRequested = down;
			if (!down && forklift.status === 'down') {
				forklift.downMinutes += Math.max(0, this.now - (forklift.downSince ?? this.now));
				forklift.downSince = null;
				forklift.status = 'idle';
				forklift.at = PARKING[forklift.id];
				forklift.legs = [];
			}
		}
		this.note(this.now, down ? { kind: 'forklifts-down', count: affected.length } : { kind: 'forklifts-back' }, down ? 'warn' : 'info');
		this.dispatch();
	}

	// ---------------------------------------------------------------- inspection

	private startInspections(): void {
		while (this.inspectorsBusy < INSPECTORS && this.inspectionQueue.length) {
			const truck = this.trucks[this.inspectionQueue.shift()!];
			this.inspectorsBusy++;
			const minutes = lognormal(stream(this.config.seed, `inspect-${truck.id}`), 45, 0.4);
			this.sim.after(minutes, () => {
				this.inspectorsBusy--;
				truck.inspected = true;
				this.note(this.now, { kind: 'inspection-released', truck: truck.id + 1, commodity: truck.commodity!.id }, 'info');
				this.dispatch();
			});
		}
	}

	// ---------------------------------------------------------------- warnings and metrics

	private note(time: number, event: ColdStorageEvent, tone: LogEntry['tone']): void {
		this.log.push({ time, event, tone });
	}

	dayComplete(): boolean {
		return this.now >= ARRIVAL_END && this.trucks.every((t) => t.phase === 'gone');
	}

	detentionFor(truck: Truck): number {
		if (truck.tArrived === null) return 0;
		const end = truck.tDeparted ?? this.now;
		return (Math.max(0, end - truck.tArrived - FREE_TIME) / 60) * DETENTION_PER_HOUR;
	}

	metrics(): ColdStorageMetrics {
		const departed = this.trucks.filter((t) => t.tDeparted !== null);
		const turns = departed.map((t) => t.tDeparted! - t.tArrived!);
		const received = this.pallets.filter((p) => p.tStaged !== null);
		const dwell = received.filter((p) => p.exposure !== null).map((p) => p.exposure!);
		const excursions = received.filter((p) => {
			const exposure = p.exposure ?? (p.state === 'staged' ? this.now - p.tStaged! : 0);
			return exposure > EXCURSION_MINUTES;
		}).length;

		const complete = this.dayComplete();
		const finish = complete ? this.lastActivity : null;
		const span = (finish ?? this.now) - OPEN;
		let busy = 0;
		let available = 0;
		for (const forklift of this.forklifts) {
			// Count only the share of the current task that has actually happened.
			const current = forklift.legs.length && forklift.status === 'busy' ? Math.max(0, forklift.legs.at(-1)!.t1 - this.now) : 0;
			busy += forklift.busyMinutes - current;
			const down = forklift.downMinutes + (forklift.downSince !== null ? Math.max(0, this.now - forklift.downSince) : 0);
			available += Math.max(0, span - down);
		}

		return {
			avgTurn: turns.length ? turns.reduce((a, b) => a + b, 0) / turns.length : null,
			detentionCost: this.trucks.reduce((sum, t) => sum + this.detentionFor(t), 0),
			inYard: this.yard.length,
			excursions,
			received: received.length,
			avgDockDwell: dwell.length ? dwell.reduce((a, b) => a + b, 0) / dwell.length : null,
			utilization: available > 0 ? Math.min(1, busy / available) : null,
			trucksDone: departed.length,
			trucksTotal: this.trucks.length,
			finish,
			dayComplete: complete,
		};
	}
}

const PRIORITY_RANKS: Record<Priority, Record<Task['kind'], number>> = {
	'unload-first': { unload: 0, load: 1, putaway: 2, transfer: 3 },
	'putaway-first': { putaway: 0, transfer: 1, unload: 2, load: 3 },
	balanced: { unload: 0, load: 0, putaway: 0, transfer: 0 },
};

/** Relative truck arrivals from the bridge: an early trickle, a late-morning wave, an afternoon wave. */
function waveIntensity(t: number): number {
	if (t < 7 * 60) return 0.35;
	if (t < 9 * 60) return 0.8;
	if (t < 11 * 60 + 30) return 1.7;
	if (t < 13 * 60 + 30) return 0.8;
	if (t < 16 * 60 + 30) return 1.4;
	return 0.5;
}

/** Map a uniform draw onto the wave profile, so the same truck lands at a consistent point in the day. */
function waveQuantile(u: number): number {
	const step = 5;
	let total = 0;
	for (let t = ARRIVAL_START; t < ARRIVAL_END; t += step) total += waveIntensity(t);
	let acc = 0;
	for (let t = ARRIVAL_START; t < ARRIVAL_END; t += step) {
		const w = waveIntensity(t);
		if (acc + w >= u * total) return t + ((u * total - acc) / w) * step;
		acc += w;
	}
	return ARRIVAL_END;
}

function clampTime(t: number): number {
	return Math.min(ARRIVAL_END, Math.max(ARRIVAL_START, t));
}

function pick<T>(rng: Rng, items: T[]): T {
	return items[Math.floor(rng() * items.length)];
}

function pickWeighted(rng: Rng, items: Commodity[]): Commodity {
	let u = rng();
	for (const item of items) {
		u -= item.share;
		if (u <= 0) return item;
	}
	return items[items.length - 1];
}

export function doorLabel(truck: Truck): string {
	return truck.kind === 'inbound' ? `I${truck.door! + 1}` : `O${truck.door! + 1}`;
}

export { formatClock };
