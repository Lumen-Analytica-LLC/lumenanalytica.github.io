import { chance, lognormal, normal, type Rng, stream, uniform } from '../../engine/rng';
import { formatClock, Simulation } from '../../engine/sim';

// All times are minutes after midnight.
export const OPEN = 7 * 60 + 30;
export const CLOSE = 17 * 60;
export const DAY_END = 20 * 60;
const BOOKING_HOURS = [8, 9, 10, 11, 13, 14, 15, 16];
const WALK_IN_START = 8 * 60;
const WALK_IN_END = 16 * 60 + 30;
const MAX_WALK_INS_PER_HOUR = 10;
const MAX_ROOMED_PER_PROVIDER = 2;
const ROOM_TURNOVER = 3;
const LONG_WAIT = 60;

export const MAX_PROVIDERS = 6;
export const MAX_ROOMS = 10;
export const SEAT_COUNT = 50;
export const CHECKIN_CLERKS = 2;

export type Template = 'staggered' | 'modified-wave' | 'block';

export const TEMPLATES: Record<Template, { label: string; offsets: number[] }> = {
	staggered: { label: 'Staggered', offsets: [0, 20, 40] },
	'modified-wave': { label: 'Modified wave', offsets: [0, 0, 30] },
	block: { label: 'Hourly block', offsets: [0, 0, 0] },
};

export interface ClinicConfig {
	seed: number;
	providers: number;
	rooms: number;
	template: Template;
	doubleBookPct: number;
	noShowPct: number;
	walkInsPerHour: number;
	disruption: boolean;
}

export const DEFAULT_CONFIG: ClinicConfig = {
	seed: 1004,
	providers: 4,
	rooms: 7,
	template: 'block',
	doubleBookPct: 10,
	noShowPct: 12,
	walkInsPerHour: 1.5,
	disruption: false,
};

export const DISRUPTION_WINDOW: [number, number] = [10 * 60, 11 * 60 + 30];

const PROVIDER_ROSTER = [
	{ name: 'Dr. Patel', initials: 'AP', meanVisit: 14 },
	{ name: 'Dr. Nguyen', initials: 'LN', meanVisit: 16 },
	{ name: 'Dr. Okafor', initials: 'CO', meanVisit: 13 },
	{ name: 'Dr. Rivera', initials: 'MR', meanVisit: 17 },
	{ name: 'Dr. Kim', initials: 'SK', meanVisit: 15 },
	{ name: 'Dr. Haddad', initials: 'NH', meanVisit: 14 },
];

export type PatientPhase =
	| 'expected'
	| 'queue-checkin'
	| 'checkin'
	| 'waiting'
	| 'rooming'
	| 'ready'
	| 'visit'
	| 'queue-checkout'
	| 'checkout'
	| 'gone';

export interface Patient {
	id: number;
	kind: 'scheduled' | 'walk-in';
	providerId: number | null;
	appt: number | null;
	arrival: number;
	noShow: boolean;
	// Pre-sampled so every scenario sees the same patients.
	checkinDur: number;
	roomingDur: number;
	visitFactor: number;
	checkoutDur: number;
	chartDur: number;
	patience: number;
	phase: PatientPhase;
	seat: number | null;
	room: number | null;
	desk: number | null;
	tArrived: number | null;
	tSeen: number | null;
	tDone: number | null;
	leftWithoutBeingSeen: boolean;
}

export type ProviderStatus = 'idle' | 'visit' | 'charting' | 'away';

export interface Segment {
	kind: 'visit' | 'charting' | 'away';
	start: number;
	end: number;
}

export interface Provider {
	id: number;
	name: string;
	initials: string;
	meanVisit: number;
	status: ProviderStatus;
	awayRequested: boolean;
	room: number | null;
	segments: Segment[];
	openSegment: Segment | null;
	booked: number[];
}

export type RoomStatus = 'free' | 'rooming' | 'ready' | 'visit' | 'cleaning';

export interface Room {
	id: number;
	status: RoomStatus;
	patient: number | null;
}

export interface Assistant {
	id: number;
	room: number | null;
}

export interface LogEntry {
	time: number;
	text: string;
	tone: 'info' | 'warn' | 'bad' | 'good';
}

export interface ClinicMetrics {
	avgWait: number | null;
	p90Wait: number | null;
	inWaitingRoom: number;
	leftWithoutBeingSeen: number;
	utilization: number | null;
	seen: number;
	arrived: number;
	finish: number | null;
	overtime: number;
	dayComplete: boolean;
}

export class ClinicSim {
	readonly config: ClinicConfig;
	readonly sim = new Simulation(OPEN);
	readonly patients: Patient[] = [];
	readonly providers: Provider[];
	readonly rooms: Room[];
	readonly assistants: Assistant[];
	readonly checkinQueue: number[] = [];
	readonly checkoutQueue: number[] = [];
	readonly checkinDesks: (number | null)[] = Array(CHECKIN_CLERKS).fill(null);
	checkoutDesk: number | null = null;
	readonly seats: (number | null)[] = Array(SEAT_COUNT).fill(null);
	readonly log: LogEntry[] = [];
	private readonly seatRng: Rng;
	private lastActivity = OPEN;

	constructor(config: ClinicConfig) {
		this.config = config;
		this.seatRng = stream(config.seed, 'seats');
		this.providers = PROVIDER_ROSTER.slice(0, config.providers).map((p, id) => ({
			...p,
			id,
			status: 'idle',
			awayRequested: false,
			room: null,
			segments: [],
			openSegment: null,
			booked: [],
		}));
		this.rooms = Array.from({ length: config.rooms }, (_, id) => ({ id, status: 'free', patient: null }));
		this.assistants = Array.from({ length: config.providers }, (_, id) => ({ id, room: null }));

		this.generatePatients();
		for (const p of this.patients) {
			if (!p.noShow) this.sim.at(p.arrival, () => this.arrive(p));
		}
		if (config.disruption && this.providers[0]) {
			const [start, end] = DISRUPTION_WINDOW;
			this.sim.at(start, () => this.startAway(this.providers[0]));
			this.sim.at(end, () => this.endAway(this.providers[0]));
		}
		this.note(OPEN, 'Doors open. Front desk staffed.', 'info');
	}

	get now(): number {
		return this.sim.now;
	}

	advance(to: number): void {
		this.sim.runUntil(Math.min(to, DAY_END));
		for (const provider of this.providers) {
			if (provider.openSegment) provider.openSegment.end = this.now;
		}
	}

	// ---------------------------------------------------------------- generation

	private generatePatients(): void {
		const { seed, template, doubleBookPct, noShowPct, walkInsPerHour } = this.config;
		const offsets = TEMPLATES[template].offsets;

		// One stream per booking slot: changing one setting doesn't reshuffle anyone else's patients.
		this.providers.forEach((provider, providerId) => {
			for (const hour of BOOKING_HOURS) {
				offsets.forEach((offset, slot) => {
					const key = `provider-${providerId}-${hour}-${slot}`;
					const appt = hour * 60 + offset;
					const doubleBooked = stream(seed, key)() < doubleBookPct / 100;
					for (const suffix of doubleBooked ? ['a', 'b'] : ['a']) {
						this.addPatient(stream(seed, `${key}-${suffix}`), 'scheduled', providerId, appt, noShowPct);
						provider.booked.push(appt);
					}
				});
			}
		});

		// Walk-ins via thinning, so a higher rate is a superset of a lower one.
		const rng = stream(seed, 'walk-ins');
		let t = WALK_IN_START;
		for (;;) {
			t += -Math.log(1 - rng()) * (60 / MAX_WALK_INS_PER_HOUR);
			if (t > WALK_IN_END) break;
			const accept = rng() < (walkInsPerHour * walkInIntensity(t)) / MAX_WALK_INS_PER_HOUR;
			const patientRng = stream(seed, `walk-in-${Math.round(t * 1000)}`);
			if (accept) this.addPatient(patientRng, 'walk-in', null, null, 0, t);
		}
	}

	private addPatient(
		rng: Rng,
		kind: Patient['kind'],
		providerId: number | null,
		appt: number | null,
		noShowPct: number,
		walkInArrival = 0,
	): void {
		// Draw every attribute unconditionally so the stream stays aligned across settings.
		const noShowDraw = rng();
		const late = chance(rng, 0.08);
		const offset = late ? uniform(rng, 10, 30) : normal(rng, -10, 7);
		const patient: Patient = {
			id: this.patients.length,
			kind,
			providerId,
			appt,
			arrival: appt === null ? walkInArrival : Math.max(OPEN, appt + offset),
			noShow: noShowDraw < noShowPct / 100,
			checkinDur: lognormal(rng, 3, 0.5),
			roomingDur: lognormal(rng, 6, 0.35),
			visitFactor: lognormal(rng, 1, 0.4),
			checkoutDur: lognormal(rng, 2.5, 0.5),
			chartDur: lognormal(rng, 2, 0.4),
			patience: uniform(rng, 45, 100),
			phase: 'expected',
			seat: null,
			room: null,
			desk: null,
			tArrived: null,
			tSeen: null,
			tDone: null,
			leftWithoutBeingSeen: false,
		};
		this.patients.push(patient);
	}

	// ---------------------------------------------------------------- events

	private arrive(p: Patient): void {
		p.phase = 'queue-checkin';
		p.tArrived = this.now;
		this.checkinQueue.push(p.id);
		if (p.kind === 'walk-in') this.sim.after(p.patience, () => this.loseIfStillWaiting(p));
		this.dispatch();
	}

	private loseIfStillWaiting(p: Patient): void {
		if (p.phase !== 'queue-checkin' && p.phase !== 'waiting') return;
		removeFrom(this.checkinQueue, p.id);
		this.freeSeat(p);
		p.phase = 'gone';
		p.leftWithoutBeingSeen = true;
		p.tDone = this.now;
		this.note(this.now, `Walk-in left without being seen after ${Math.round(this.now - p.tArrived!)} min`, 'bad');
		this.dispatch();
	}

	private startAway(provider: Provider): void {
		provider.awayRequested = true;
		this.note(this.now, `${provider.name} pulled away for an urgent matter`, 'warn');
		if (provider.status === 'idle') this.setStatus(provider, 'away');
	}

	private endAway(provider: Provider): void {
		provider.awayRequested = false;
		if (provider.status === 'away') this.setStatus(provider, 'idle');
		const backlog = this.patients.filter(
			(p) => p.providerId === provider.id && ['waiting', 'rooming', 'ready'].includes(p.phase),
		).length;
		this.note(this.now, `${provider.name} back. ${backlog} patient${backlog === 1 ? '' : 's'} waiting on them`, 'info');
		this.dispatch();
	}

	/** Start every activity whose resources are free. */
	private dispatch(): void {
		this.startCheckins();
		this.startRooming();
		this.startVisits();
		this.startCheckout();
	}

	private startCheckins(): void {
		for (let desk = 0; desk < this.checkinDesks.length; desk++) {
			if (this.checkinDesks[desk] !== null || !this.checkinQueue.length) continue;
			const p = this.patients[this.checkinQueue.shift()!];
			this.checkinDesks[desk] = p.id;
			p.phase = 'checkin';
			p.desk = desk;
			this.sim.after(p.checkinDur, () => {
				this.checkinDesks[desk] = null;
				p.desk = null;
				p.phase = 'waiting';
				p.seat = this.takeSeat(p.id);
				this.dispatch();
			});
		}
	}

	private startRooming(): void {
		const waiting = this.patients
			.filter((p) => p.phase === 'waiting')
			.sort((a, b) => priority(a) - priority(b));
		for (const p of waiting) {
			const room = this.rooms.find((r) => r.status === 'free');
			const assistant = this.assistants.find((a) => a.room === null);
			if (!room || !assistant) return;

			const providerId = p.providerId ?? this.pickProviderForWalkIn();
			if (providerId === null || this.roomedCount(providerId) >= MAX_ROOMED_PER_PROVIDER) continue;

			p.providerId = providerId;
			p.phase = 'rooming';
			p.room = room.id;
			this.freeSeat(p);
			room.status = 'rooming';
			room.patient = p.id;
			assistant.room = room.id;
			this.sim.after(p.roomingDur, () => {
				assistant.room = null;
				room.status = 'ready';
				p.phase = 'ready';
				this.dispatch();
			});
		}
	}

	private startVisits(): void {
		for (const provider of this.providers) {
			if (provider.status !== 'idle' || provider.awayRequested) continue;
			const next = this.patients
				.filter((p) => p.phase === 'ready' && p.providerId === provider.id)
				.sort((a, b) => priority(a) - priority(b))[0];
			if (!next) continue;

			const room = this.rooms[next.room!];
			next.phase = 'visit';
			next.tSeen = this.now;
			room.status = 'visit';
			provider.room = room.id;
			this.setStatus(provider, 'visit');
			const wait = this.now - waitStart(next);
			if (wait >= LONG_WAIT) {
				this.note(this.now, `${provider.name} sees a patient who waited ${Math.round(wait)} min`, 'warn');
			}

			this.sim.after(provider.meanVisit * next.visitFactor, () => {
				next.phase = 'queue-checkout';
				next.room = null;
				this.checkoutQueue.push(next.id);
				room.status = 'cleaning';
				room.patient = null;
				this.sim.after(ROOM_TURNOVER, () => {
					room.status = 'free';
					this.dispatch();
				});
				provider.room = null;
				this.setStatus(provider, 'charting');
				this.sim.after(next.chartDur, () => {
					this.setStatus(provider, provider.awayRequested ? 'away' : 'idle');
					this.dispatch();
				});
				this.dispatch();
			});
		}
	}

	private startCheckout(): void {
		if (this.checkoutDesk !== null || !this.checkoutQueue.length) return;
		const p = this.patients[this.checkoutQueue.shift()!];
		this.checkoutDesk = p.id;
		p.phase = 'checkout';
		this.sim.after(p.checkoutDur, () => {
			this.checkoutDesk = null;
			p.phase = 'gone';
			p.tDone = this.now;
			this.lastActivity = this.now;
			if (this.dayComplete()) this.note(this.now, 'Last patient out. Day complete', 'good');
			this.dispatch();
		});
	}

	// ---------------------------------------------------------------- helpers

	private pickProviderForWalkIn(): number | null {
		let best: number | null = null;
		let bestLoad = Infinity;
		for (const provider of this.providers) {
			if (provider.awayRequested) continue;
			const load =
				this.roomedCount(provider.id) * 10 +
				this.patients.filter((p) => p.providerId === provider.id && p.phase === 'waiting').length;
			if (this.roomedCount(provider.id) < MAX_ROOMED_PER_PROVIDER && load < bestLoad) {
				best = provider.id;
				bestLoad = load;
			}
		}
		return best;
	}

	private roomedCount(providerId: number): number {
		return this.patients.filter(
			(p) => p.providerId === providerId && (p.phase === 'rooming' || p.phase === 'ready' || p.phase === 'visit'),
		).length;
	}

	private setStatus(provider: Provider, status: ProviderStatus): void {
		if (provider.openSegment) provider.openSegment.end = this.now;
		provider.openSegment = null;
		provider.status = status;
		if (status !== 'idle') {
			provider.openSegment = { kind: status, start: this.now, end: this.now };
			provider.segments.push(provider.openSegment);
		}
		this.lastActivity = Math.max(this.lastActivity, this.now);
	}

	private takeSeat(patientId: number): number | null {
		const free = this.seats.flatMap((s, i) => (s === null ? [i] : []));
		if (!free.length) return null;
		const seat = free[Math.floor(this.seatRng() * free.length)];
		this.seats[seat] = patientId;
		return seat;
	}

	private freeSeat(p: Patient): void {
		if (p.seat !== null) this.seats[p.seat] = null;
		p.seat = null;
	}

	private note(time: number, text: string, tone: LogEntry['tone']): void {
		this.log.push({ time, text, tone });
	}

	dayComplete(): boolean {
		return this.patients.every((p) => p.noShow || p.phase === 'gone') && this.now >= WALK_IN_END;
	}

	// ---------------------------------------------------------------- metrics

	metrics(): ClinicMetrics {
		const arrived = this.patients.filter((p) => !p.noShow);
		const waits = arrived
			.filter((p) => p.tSeen !== null)
			.map((p) => Math.max(0, p.tSeen! - waitStart(p)))
			.sort((a, b) => a - b);
		const avgWait = waits.length ? waits.reduce((a, b) => a + b, 0) / waits.length : null;
		const p90Wait = waits.length ? waits[Math.min(waits.length - 1, Math.floor(waits.length * 0.9))] : null;

		const complete = this.dayComplete();
		const finish = complete ? this.lastActivity : null;

		// Share of on-duty time (8:00 until now, minus time pulled away) spent with patients.
		const span = Math.max(0, (finish ?? this.now) - 8 * 60);
		let busy = 0;
		let available = 0;
		for (const provider of this.providers) {
			const away = sum(provider.segments.filter((s) => s.kind === 'away').map((s) => s.end - s.start));
			busy += sum(provider.segments.filter((s) => s.kind === 'visit').map((s) => s.end - s.start));
			available += Math.max(0, span - away);
		}

		return {
			avgWait,
			p90Wait,
			inWaitingRoom: arrived.filter((p) => ['queue-checkin', 'checkin', 'waiting'].includes(p.phase)).length,
			leftWithoutBeingSeen: arrived.filter((p) => p.leftWithoutBeingSeen).length,
			utilization: available > 0 ? busy / available : null,
			seen: waits.length,
			arrived: arrived.filter((p) => p.tArrived !== null).length,
			finish,
			overtime: Math.max(0, (finish ?? this.now) - CLOSE),
			dayComplete: complete,
		};
	}
}

/** Scheduled patients by appointment time; walk-ins slot in behind anyone due within 15 minutes. */
function priority(p: Patient): number {
	return p.appt !== null ? Math.max(p.appt, p.tArrived ?? p.appt) : (p.tArrived ?? p.arrival) + 15;
}

/** Waits count from the appointment time, or from arrival when the patient is late or walked in. */
export function waitStart(p: Patient): number {
	return Math.max(p.tArrived ?? p.arrival, p.appt ?? 0);
}

/** Relative walk-in demand: busy mornings, quieter late afternoon. */
function walkInIntensity(t: number): number {
	if (t < 10 * 60) return 1.4;
	if (t < 14 * 60) return 1;
	if (t < 16 * 60) return 0.8;
	return 0.4;
}

function removeFrom(list: number[], value: number): void {
	const i = list.indexOf(value);
	if (i >= 0) list.splice(i, 1);
}

function sum(values: number[]): number {
	return values.reduce((a, b) => a + b, 0);
}

export { formatClock };
