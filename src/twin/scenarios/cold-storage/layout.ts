// World units are roughly meters. Origin is the top-left corner of the truck yard.
export const WORLD = { width: 64, height: 34 };

export type Zone = 'dock' | 'precool' | 'hold' | 'cooler' | 'mild';
export type StorageZone = 'cooler' | 'mild';

export interface Point {
	x: number;
	y: number;
}

/** A place a forklift can stop. `laneY` is the aisle it drives along inside a room. */
export interface Spot extends Point {
	zone: Zone;
	laneY?: number;
}

export interface Rect {
	x: number;
	y: number;
	w: number;
	h: number;
}

export const MAX_INBOUND_DOORS = 10;
export const OUTBOUND_DOORS = 4;
export const MAX_FORKLIFTS = 12;

export const YARD: Rect = { x: 0, y: 0, w: WORLD.width, h: 10 };
export const DOCK_WALL_Y = 10;
export const ROOM_WALL_Y = 15.5;
export const DOCK: Rect = { x: 0, y: DOCK_WALL_Y, w: WORLD.width, h: ROOM_WALL_Y - DOCK_WALL_Y };
/** Main forklift lane running the length of the dock. */
export const DOCK_LANE_Y = 14.6;
/** Lane where trucks queue after the gate, and the road they leave by. */
export const YARD_LANE_Y = 1.3;
export const DOOR_WIDTH = 3;

export function inboundDoorX(door: number): number {
	return 7.4 + door * 4;
}

export function outboundDoorX(door: number): number {
	return 48.6 + door * 4;
}

/** Truck centre when backed into a door (cab towards the yard). */
export function truckAtDoor(x: number): Point {
	return { x, y: 6.2 };
}

/** Where a forklift picks from or drops into a trailer at a door. */
export function trailerSpot(x: number): Spot {
	return { x, y: 9.5, zone: 'dock' };
}

export const STAGING_PER_DOOR = 8;

/** Staging lane in front of an inbound door: two rows of four pallets. */
export function stagingSpot(door: number, i: number): Spot {
	const x = inboundDoorX(door) + (i % 4) * 1 - 1.5;
	return { x, y: 11.1 + Math.floor(i / 4) * 1.15, zone: 'dock' };
}

export const PARKING: Spot[] = Array.from({ length: MAX_FORKLIFTS }, (_, i) => ({
	x: 0.9 + (i % 4) * 1.2,
	y: 11.1 + Math.floor(i / 4) * 1.15,
	zone: 'dock' as const,
}));

export const ROOMS: Record<Exclude<Zone, 'dock'>, Rect & { temp: string }> = {
	precool: { x: 0, y: ROOM_WALL_Y, w: 12, h: WORLD.height - ROOM_WALL_Y, temp: 'Forced air' },
	hold: { x: 12, y: ROOM_WALL_Y, w: 8, h: WORLD.height - ROOM_WALL_Y, temp: '34°F' },
	cooler: { x: 20, y: ROOM_WALL_Y, w: 26, h: WORLD.height - ROOM_WALL_Y, temp: '34°F' },
	mild: { x: 46, y: ROOM_WALL_Y, w: 18, h: WORLD.height - ROOM_WALL_Y, temp: '50°F' },
};

/** Each room's door sits on the dock wall, at the room's own forklift aisle. */
export function roomDoorX(zone: Exclude<Zone, 'dock'>): number {
	return ROOMS[zone].x + 1.2;
}

/** Floor-stacked positions (pre-cool tunnel, inspection hold), filled row by row. */
function floorSlots(zone: 'precool' | 'hold'): Spot[] {
	const room = ROOMS[zone];
	const spots: Spot[] = [];
	for (let y = room.y + 2.1; y <= room.y + room.h - 0.7; y += 1.15) {
		for (let x = room.x + 2.6; x <= room.x + room.w - 0.6; x += 1.15) {
			spots.push({ x, y, zone, laneY: y });
		}
	}
	return spots;
}

export const PRECOOL_SLOTS = floorSlots('precool');
export const HOLD_SLOTS = floorSlots('hold');

const AISLES = [19.4, 24.6, 29.8];
export const RACK_LEVELS = 3;

/** Rack bays (each holds RACK_LEVELS pallets), two rows per aisle. */
function rackBays(zone: StorageZone): Spot[] {
	const room = ROOMS[zone];
	const bays: Spot[] = [];
	for (const aisle of AISLES) {
		for (const y of [aisle - 1.25, aisle + 1.25]) {
			for (let x = room.x + 2.6; x <= room.x + room.w - 0.6; x += 1.15) {
				bays.push({ x, y, zone, laneY: aisle });
			}
		}
	}
	return bays;
}

export const BAYS: Record<StorageZone, Spot[]> = {
	cooler: rackBays('cooler'),
	mild: rackBays('mild'),
};

export { AISLES };

/** The path from the dock lane to a spot (reverse it to leave). */
function entry(spot: Spot): Point[] {
	if (spot.zone === 'dock') return [{ x: spot.x, y: DOCK_LANE_Y }, spot];
	const doorX = roomDoorX(spot.zone);
	const laneY = spot.laneY ?? spot.y;
	return [
		{ x: doorX, y: DOCK_LANE_Y },
		{ x: doorX, y: ROOM_WALL_Y },
		{ x: doorX, y: laneY },
		{ x: spot.x, y: laneY },
		spot,
	];
}

/** Forklift route: out of the current room, along the dock lane, into the target. */
export function forkliftPath(from: Spot, to: Spot): Point[] {
	const out = entry(from).reverse().slice(1);
	const path = [from, ...out, ...entry(to)];
	// Drop zero-length steps so headings stay stable.
	return path.filter((p, i) => i === 0 || Math.hypot(p.x - path[i - 1].x, p.y - path[i - 1].y) > 0.01);
}

export function pathLength(path: Point[]): number {
	let length = 0;
	for (let i = 1; i < path.length; i++) length += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
	return length;
}

/** Position and heading a given distance along a path. */
export function pointAlong(path: Point[], distance: number): { x: number; y: number; heading: number } {
	let remaining = Math.max(0, distance);
	for (let i = 1; i < path.length; i++) {
		const a = path[i - 1];
		const b = path[i];
		const d = Math.hypot(b.x - a.x, b.y - a.y);
		const heading = Math.atan2(b.y - a.y, b.x - a.x);
		if (remaining <= d || i === path.length - 1) {
			const f = d > 0 ? Math.min(1, remaining / d) : 1;
			return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, heading };
		}
		remaining -= d;
	}
	const last = path[path.length - 1];
	return { x: last.x, y: last.y, heading: 0 };
}
