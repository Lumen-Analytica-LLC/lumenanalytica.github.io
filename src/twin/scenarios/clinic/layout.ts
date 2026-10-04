import { CHECKIN_CLERKS, MAX_PROVIDERS, MAX_ROOMS, SEAT_COUNT } from './model';

// World units are roughly meters. Origin is the top-left corner of the building.
export const WORLD = { width: 48, height: 28 };

export type Area = 'lobby' | 'station' | 'corridor' | `exam-${number}`;

export interface Point {
	x: number;
	y: number;
}

export interface Waypoint extends Point {
	area: Area;
}

export interface Rect {
	x: number;
	y: number;
	w: number;
	h: number;
}

const CORRIDOR_Y = 14;
export const CORRIDOR: Rect = { x: 0, y: 12, w: 48, h: 4 };
export const LOBBY: Rect = { x: 0, y: 0, w: 31, h: 12 };
export const STATION: Rect = { x: 31, y: 0, w: 17, h: 12 };
export const EXAM_TOP = 16;
export const EXAM_HEIGHT = 12;
export const EXAM_WIDTH = WORLD.width / MAX_ROOMS;

/** Door openings, centred on the wall they sit in. */
export const DOORS: Record<'lobby' | 'station', Point> = {
	lobby: { x: 24, y: 12 },
	station: { x: 39.5, y: 12 },
};
export const ENTRANCE: Point = { x: 0, y: 8.5 };
export const OUTSIDE: Point = { x: -2.5, y: 8.5 };

export function examRect(room: number): Rect {
	return { x: room * EXAM_WIDTH, y: EXAM_TOP, w: EXAM_WIDTH, h: EXAM_HEIGHT };
}

export function examDoor(room: number): Point {
	return { x: room * EXAM_WIDTH + 1.4, y: EXAM_TOP };
}

/** Where the patient sits on the exam table. */
export function examTable(room: number): Point {
	return { x: room * EXAM_WIDTH + EXAM_WIDTH - 1.5, y: EXAM_TOP + 6.5 };
}

export function examProviderSpot(room: number): Point {
	return { x: room * EXAM_WIDTH + 1.6, y: EXAM_TOP + 6.2 };
}

export function examAssistantSpot(room: number): Point {
	return { x: room * EXAM_WIDTH + 1.6, y: EXAM_TOP + 3.4 };
}

// Front desk: two check-in windows and one checkout window along the lobby's top wall.
export const DESK: Rect = { x: 1.5, y: 1.6, w: 13, h: 1.1 };
export const CHECKIN_WINDOWS: Point[] = [3.5, 7].slice(0, CHECKIN_CLERKS).map((x) => ({ x, y: 3.6 }));
export const CHECKOUT_WINDOW: Point = { x: 12, y: 3.6 };
export const CLERK_SPOTS: Point[] = [...CHECKIN_WINDOWS, CHECKOUT_WINDOW].map((p) => ({ x: p.x, y: 0.9 }));

export function checkinQueueSpot(i: number): Point {
	const col = Math.floor(i / 6);
	return { x: 5.25 - col * 2, y: 5.2 + (i % 6) * 1.05 };
}

export function checkoutQueueSpot(i: number): Point {
	const col = Math.floor(i / 6);
	return { x: 12 + col * 1.6, y: 5.2 + (i % 6) * 1.05 };
}

/** Waiting room chairs: two blocks either side of the aisle to the clinic door. */
export const SEATS: Point[] = (() => {
	const rows = [4.4, 5.5, 7.6, 8.7, 10.6];
	const columns = [16, 17.1, 18.2, 19.3, 20.4, 21.5, 22.6, 25.6, 26.7, 27.8];
	const seats = rows.flatMap((y) => columns.map((x) => ({ x, y })));
	return seats.slice(0, SEAT_COUNT);
})();

// Care team station: a desk per provider, assistants' bench below.
export const PROVIDER_DESKS: Point[] = Array.from({ length: MAX_PROVIDERS }, (_, i) => ({
	x: 33 + i * 2.6,
	y: 4,
}));
export const ASSISTANT_SPOTS: Point[] = Array.from({ length: MAX_PROVIDERS }, (_, i) => ({
	x: 33 + i * 2.6,
	y: 9,
}));

export function areaDoor(area: Area): Point | null {
	if (area === 'lobby') return DOORS.lobby;
	if (area === 'station') return DOORS.station;
	if (area.startsWith('exam-')) return examDoor(Number(area.slice(5)));
	return null;
}

/**
 * Route between two points through doors and along the corridor, the way people
 * actually walk the building. `lane` offsets corridor travel so people don't overlap.
 */
export function route(from: Waypoint, to: Waypoint, lane = 0): Waypoint[] {
	if (from.area === to.area) return [to];
	const path: Waypoint[] = [];
	const corridorY = CORRIDOR_Y + lane;
	const fromDoor = areaDoor(from.area);
	const toDoor = areaDoor(to.area);

	if (fromDoor) {
		path.push({ ...fromDoor, area: from.area });
		path.push({ x: fromDoor.x, y: corridorY, area: 'corridor' });
	} else {
		path.push({ x: from.x, y: corridorY, area: 'corridor' });
	}
	if (toDoor) {
		path.push({ x: toDoor.x, y: corridorY, area: 'corridor' });
		path.push({ ...toDoor, area: to.area });
	}
	path.push(to);
	return path;
}
