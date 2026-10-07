interface ScheduledEvent {
	time: number;
	seq: number;
	fn: () => void;
}

/**
 * Minimal discrete-event simulation core: a time-ordered event queue.
 * Ties are broken by insertion order so runs are deterministic.
 */
export class Simulation {
	now: number;
	private heap: ScheduledEvent[] = [];
	private seq = 0;

	constructor(startTime = 0) {
		this.now = startTime;
	}

	at(time: number, fn: () => void): void {
		this.push({ time: Math.max(time, this.now), seq: this.seq++, fn });
	}

	after(delay: number, fn: () => void): void {
		this.at(this.now + delay, fn);
	}

	get pending(): number {
		return this.heap.length;
	}

	/** Process every event up to and including `time`, then park the clock there. */
	runUntil(time: number): void {
		while (this.heap.length && this.heap[0].time <= time) {
			const event = this.pop();
			this.now = event.time;
			event.fn();
		}
		this.now = Math.max(this.now, time);
	}

	private before(a: ScheduledEvent, b: ScheduledEvent): boolean {
		return a.time < b.time || (a.time === b.time && a.seq < b.seq);
	}

	private push(event: ScheduledEvent): void {
		const heap = this.heap;
		heap.push(event);
		let i = heap.length - 1;
		while (i > 0) {
			const parent = (i - 1) >> 1;
			if (!this.before(heap[i], heap[parent])) break;
			[heap[i], heap[parent]] = [heap[parent], heap[i]];
			i = parent;
		}
	}

	private pop(): ScheduledEvent {
		const heap = this.heap;
		const top = heap[0];
		const last = heap.pop()!;
		if (heap.length) {
			heap[0] = last;
			let i = 0;
			for (;;) {
				const l = 2 * i + 1;
				const r = l + 1;
				let m = i;
				if (l < heap.length && this.before(heap[l], heap[m])) m = l;
				if (r < heap.length && this.before(heap[r], heap[m])) m = r;
				if (m === i) break;
				[heap[i], heap[m]] = [heap[m], heap[i]];
				i = m;
			}
		}
		return top;
	}
}

/** Format minutes-after-midnight as "9:05 AM" (or "9:05 a. m." in Spanish). */
export function formatClock(minutes: number, lang: 'en' | 'es' = 'en'): string {
	const total = Math.floor(minutes);
	const h24 = Math.floor(total / 60) % 24;
	const m = total % 60;
	const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
	const suffix = lang === 'es' ? (h24 < 12 ? 'a. m.' : 'p. m.') : h24 < 12 ? 'AM' : 'PM';
	return `${h12}:${m.toString().padStart(2, '0')} ${suffix}`;
}
