/** A function returning uniform random numbers in [0, 1). */
export type Rng = () => number;

/** Small, fast, seedable PRNG (mulberry32). */
export function mulberry32(seed: number): Rng {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function hashString(str: string): number {
	let h = 0x811c9dc5;
	for (let i = 0; i < str.length; i++) {
		h ^= str.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	return h >>> 0;
}

/**
 * Independent named stream for one source of randomness. Keeping sources separate
 * (arrivals, durations, …) means changing one setting doesn't reshuffle the others,
 * so scenarios compare the same simulated day.
 */
export function stream(seed: number, name: string): Rng {
	return mulberry32((seed ^ hashString(name)) >>> 0);
}

export function normal(rng: Rng, mean = 0, sd = 1): number {
	const u = 1 - rng();
	const v = rng();
	return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Lognormal parameterised by its mean and coefficient of variation. */
export function lognormal(rng: Rng, mean: number, cv: number): number {
	const sigma2 = Math.log(1 + cv * cv);
	const mu = Math.log(mean) - sigma2 / 2;
	return Math.exp(mu + Math.sqrt(sigma2) * normal(rng));
}

export function exponential(rng: Rng, rate: number): number {
	return -Math.log(1 - rng()) / rate;
}

export function uniform(rng: Rng, min: number, max: number): number {
	return min + (max - min) * rng();
}

export function chance(rng: Rng, p: number): boolean {
	return rng() < p;
}
