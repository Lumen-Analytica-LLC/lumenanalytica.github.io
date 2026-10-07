import type { Lang } from '.';
import type { ClinicEvent, Template } from '../twin/scenarios/clinic/model';
import type {
	ArrivalPattern,
	ColdStorageEvent,
	CommodityId,
	HoldingArea,
	Priority,
} from '../twin/scenarios/cold-storage/model';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Shared demo chrome: toolbar, panels, playback. */
const COMMON = {
	en: {
		play: 'Play',
		pause: 'Pause',
		restart: 'Restart day',
		newDay: 'New day',
		whatIf: 'What if…',
		speed: 'Playback speed',
		events: 'Events',
		dayComplete: 'Day complete.',
	},
	es: {
		play: 'Reproducir',
		pause: 'Pausa',
		restart: 'Reiniciar día',
		newDay: 'Nuevo día',
		whatIf: '¿Y si…?',
		speed: 'Velocidad',
		events: 'Eventos',
		dayComplete: 'Día terminado.',
	},
};

export const CLINIC_TEXT = {
	en: {
		...COMMON.en,
		aria: 'Clinic digital twin simulation',
		floorAria:
			'Top-down floor plan of the clinic with patients and staff moving between the front desk, waiting room and exam rooms',
		boardAria: 'Timeline per provider comparing booked appointments with actual patient time, charting and time away',
		clockLabel: 'Clinic time',
		newDayTitle: 'Same settings, a different day of patients',
		hint: 'Changes replay the day up to now with the same patients, so you see only the effect of your change.',
		canvas: {
			entrance: 'Entrance',
			frontDesk: 'Front desk',
			waitingRoom: 'Waiting room',
			careTeam: 'Care team station',
			checkin: 'Check-in',
			checkout: 'Checkout',
			assistants: 'Medical assistants',
			exam: (n: number) => `Exam ${n}`,
			closed: 'Closed',
			away: 'away',
		},
		kpis: {
			avgWait: 'Avg wait to provider',
			p90Wait: '90th percentile wait',
			waiting: 'In the waiting room',
			lwbs: 'Left without being seen',
			utilization: 'Provider utilization',
			finish: 'Last patient out',
		},
		sub: {
			seen: (n: number) => plural(n, 'patient seen', 'patients seen'),
			p90: '1 in 10 wait at least this long',
			arrived: (n: number) => `${n} arrived so far`,
			lwbs: 'Walk-ins who gave up',
			utilization: 'Provider time with patients',
			overtime: (minutes: number) => `${minutes} min past 5:00 PM close`,
			close: 'Close is 5:00 PM',
			running: 'Running',
		},
		legend: {
			people: 'People',
			ok: 'Waiting < 15 min',
			warn: '15–30 min',
			bad: '30+ min',
			seen: 'Seen by provider',
			provider: 'Provider',
			assistant: 'Medical assistant',
			clerk: 'Front desk',
			roomTitle: 'Exam room light:',
			rooming: 'Rooming',
			ready: 'Waiting for provider',
			visit: 'With provider',
			cleaning: 'Turnover',
		},
		board: { title: 'Provider availability', booked: 'Booked', visit: 'With patient', charting: 'Charting', away: 'Away' },
		controls: {
			providers: 'Providers',
			rooms: 'Exam rooms',
			template: 'Appointment template',
			doubleBook: 'Double-booked slots',
			noShow: 'No-show rate',
			walkIns: 'Walk-ins per hour',
			disruption: (start: string, end: string) => `Pull Dr. Patel away ${start}–${end}`,
		},
		templates: { staggered: 'Staggered', 'modified-wave': 'Modified wave', block: 'Hourly block' } satisfies Record<Template, string>,
		summary: (avgWait: string, lost: number, finish: string, suggestion: string) =>
			`Average wait ${avgWait}, ${plural(lost, 'walk-in', 'walk-ins')} lost, last patient out at ${finish}. ${suggestion}`,
		suggestions: {
			staggered: 'Try the staggered template and see what happens to the wait.',
			capacity: 'Try another exam room or provider to absorb the walk-ins.',
			disrupt: 'Try pulling a provider away mid-morning to stress-test the day.',
		},
		event: (e: ClinicEvent): string => {
			switch (e.kind) {
				case 'open':
					return 'Doors open. Front desk staffed.';
				case 'left-without-being-seen':
					return `Walk-in left without being seen after ${e.minutes} min`;
				case 'provider-away':
					return `${e.name} pulled away for an urgent matter`;
				case 'provider-back':
					return `${e.name} back. ${plural(e.waiting, 'patient', 'patients')} waiting on them`;
				case 'long-wait':
					return `${e.name} sees a patient who waited ${e.minutes} min`;
				case 'day-complete':
					return 'Last patient out. Day complete';
			}
		},
	},
	es: {
		...COMMON.es,
		aria: 'Simulación del gemelo digital de una clínica',
		floorAria:
			'Plano de la clínica visto desde arriba, con pacientes y personal moviéndose entre la recepción, la sala de espera y los consultorios',
		boardAria: 'Línea de tiempo por médico que compara las citas agendadas con el tiempo real con pacientes, notas clínicas y ausencias',
		clockLabel: 'Hora en la clínica',
		newDayTitle: 'Mismos ajustes, otro día de pacientes',
		hint: 'Los cambios repiten el día hasta este momento con los mismos pacientes, para que vea solo el efecto de su cambio.',
		canvas: {
			entrance: 'Entrada',
			frontDesk: 'Recepción',
			waitingRoom: 'Sala de espera',
			careTeam: 'Estación del equipo médico',
			checkin: 'Registro',
			checkout: 'Salida',
			assistants: 'Asistentes médicos',
			exam: (n: number) => `Consultorio ${n}`,
			closed: 'Cerrado',
			away: 'ausente',
		},
		kpis: {
			avgWait: 'Espera prom. al médico',
			p90Wait: 'Espera del percentil 90',
			waiting: 'En la sala de espera',
			lwbs: 'Se fueron sin ser atendidos',
			utilization: 'Ocupación de médicos',
			finish: 'Sale el último paciente',
		},
		sub: {
			seen: (n: number) => plural(n, 'paciente atendido', 'pacientes atendidos'),
			p90: '1 de cada 10 espera al menos esto',
			arrived: (n: number) => `${n} han llegado`,
			lwbs: 'Pacientes sin cita que se fueron',
			utilization: 'Tiempo del médico con pacientes',
			overtime: (minutes: number) => `${minutes} min después del cierre (5:00 p. m.)`,
			close: 'Cierre a las 5:00 p. m.',
			running: 'En curso',
		},
		legend: {
			people: 'Personas',
			ok: 'Esperando < 15 min',
			warn: '15–30 min',
			bad: '30+ min',
			seen: 'Ya atendido',
			provider: 'Médico',
			assistant: 'Asistente médico',
			clerk: 'Recepción',
			roomTitle: 'Luz del consultorio:',
			rooming: 'Preparando',
			ready: 'Esperando al médico',
			visit: 'Con el médico',
			cleaning: 'Limpieza',
		},
		board: { title: 'Disponibilidad de médicos', booked: 'Agendado', visit: 'Con paciente', charting: 'Notas clínicas', away: 'Ausente' },
		controls: {
			providers: 'Médicos',
			rooms: 'Consultorios',
			template: 'Plantilla de citas',
			doubleBook: 'Citas dobles',
			noShow: 'Inasistencias',
			walkIns: 'Pacientes sin cita por hora',
			disruption: (start: string, end: string) => `Retirar al Dr. Patel de ${start} a ${end}`,
		},
		templates: { staggered: 'Escalonada', 'modified-wave': 'Ola modificada', block: 'Bloque por hora' } satisfies Record<Template, string>,
		summary: (avgWait: string, lost: number, finish: string, suggestion: string) =>
			`Espera promedio de ${avgWait}, ${plural(lost, 'paciente sin cita perdido', 'pacientes sin cita perdidos')}, último paciente sale a las ${finish}. ${suggestion}`,
		suggestions: {
			staggered: 'Pruebe la plantilla escalonada y vea qué pasa con la espera.',
			capacity: 'Pruebe otro consultorio u otro médico para absorber a los pacientes sin cita.',
			disrupt: 'Pruebe retirar a un médico a media mañana para poner el día a prueba.',
		},
		event: (e: ClinicEvent): string => {
			switch (e.kind) {
				case 'open':
					return 'Se abren las puertas. Recepción lista.';
				case 'left-without-being-seen':
					return `Un paciente sin cita se fue sin ser atendido después de ${e.minutes} min`;
				case 'provider-away':
					return `${e.name} sale por una urgencia`;
				case 'provider-back':
					return `${e.name} regresa. ${plural(e.waiting, 'paciente lo espera', 'pacientes lo esperan')}`;
				case 'long-wait':
					return `${e.name} atiende a un paciente que esperó ${e.minutes} min`;
				case 'day-complete':
					return 'Sale el último paciente. Día terminado';
			}
		},
	},
};

const COMMODITIES: Record<Lang, Record<CommodityId, string>> = {
	en: {
		berries: 'Berries',
		'leafy-greens': 'Leafy greens',
		broccoli: 'Broccoli',
		avocados: 'Avocados',
		tomatoes: 'Tomatoes',
		peppers: 'Peppers',
		limes: 'Limes',
	},
	es: {
		berries: 'Frutos rojos',
		'leafy-greens': 'Verduras de hoja',
		broccoli: 'Brócoli',
		avocados: 'Aguacates',
		tomatoes: 'Tomates',
		peppers: 'Chiles',
		limes: 'Limones',
	},
};

const AREAS: Record<Lang, Record<HoldingArea, string>> = {
	en: { precool: 'Pre-cool tunnel', hold: 'Inspection hold', cooler: 'Cooler', mild: 'Mild room' },
	es: { precool: 'Túnel de preenfriado', hold: 'Retención por inspección', cooler: 'Cámara fría', mild: 'Cuarto templado' },
};

export const COLD_TEXT = {
	en: {
		...COMMON.en,
		aria: 'Cold storage cross-dock digital twin simulation',
		floorAria:
			'Top-down view of a produce cross-dock: trucks queue in the yard and back into dock doors while forklifts move pallets to the pre-cool tunnel, inspection hold, cooler and mild room',
		boardAria: 'Timeline of trucks at each dock door, with detention time highlighted, and trucks waiting in the yard',
		clockLabel: 'Dock time',
		newDayTitle: 'Same settings, a different day of trucks',
		hint: 'Changes replay the day up to now with the same trucks, so you see only the effect of your change.',
		areas: AREAS.en,
		canvas: {
			fromBridge: 'From the bridge →',
			chargers: 'Chargers',
			inboundDoors: 'Inbound doors',
			outbound: 'Outbound',
			atGate: (n: number) => `+${n} at the gate`,
			pallets: (used: number, total: number) => `${used}/${total} pallets`,
			inInspection: (n: number) => plural(n, 'load in inspection', 'loads in inspection'),
			yardQueue: 'Yard queue',
			yard: 'Yard',
			door: (label: string) => `Door ${label}`,
		},
		kpis: {
			turn: 'Avg truck turn',
			detention: 'Detention cost',
			yard: 'Trucks in the yard',
			excursions: 'Temperature excursions',
			dwell: 'Avg dock dwell',
			utilization: 'Forklift utilization',
		},
		sub: {
			trucksDone: (done: number, total: number) => `${done} of ${total} trucks done`,
			detention: 'Past 2 h free time at $75/h',
			yard: 'Trucks waiting for a door',
			excursions: (received: number, minutes: number) => `of ${received} pallets, ${minutes}+ min on dock`,
			dwell: 'Unload to put-away',
			drivers: (n: number) => plural(n, 'forklift driver', 'forklift drivers'),
		},
		legend: {
			pallets: 'Pallets:',
			ok: (m: number) => `On dock < ${m} min`,
			warn: (a: number, b: number) => `${a}–${b} min`,
			bad: (m: number) => `${m}+ min (excursion)`,
			precool: 'Pre-cooling',
			hold: 'Inspection hold',
			cold: 'Cooler stock',
			mild: 'Mild room stock',
			vehicles: 'Vehicles:',
			inbound: 'Inbound',
			outbound: 'Outbound',
			forklift: 'Forklift',
			stripe: 'Trailer stripe shows time on site against 2 h free time.',
		},
		board: { title: 'Dock doors', inbound: 'Inbound at door', outbound: 'Outbound at door', detention: 'Detention' },
		controls: {
			forklifts: 'Forklift drivers',
			doors: 'Inbound dock doors',
			trucks: 'Inbound trucks per day',
			arrivals: 'Truck arrivals',
			priority: 'Forklift priority',
			inspection: 'Loads held for inspection',
			precool: 'Pre-cool tunnel (pallets)',
			surge: 'Peak-season surge (+40% trucks)',
			down: (start: string, end: string) => `Two forklifts down ${start}–${end}`,
		},
		patterns: { waves: 'Bridge waves', appointments: 'Appointments' } satisfies Record<ArrivalPattern, string>,
		priorities: { 'unload-first': 'Unload first', balanced: 'Balanced', 'putaway-first': 'Put away first' } satisfies Record<Priority, string>,
		summary: (turn: string, detention: string, warm: number, ended: string, suggestion: string) =>
			`Average truck turn ${turn}, ${detention} in detention, ${plural(warm, 'pallet', 'pallets')} warmed on the dock, ${ended}. ${suggestion}`,
		ended: (finish: string) => `last truck out at ${finish}`,
		notEnded: 'trucks still on site at midnight',
		suggestions: {
			balanced: 'Try Balanced forklift priority and watch the warm pallets.',
			appointments: 'Try dock appointments instead of bridge waves.',
			driver: 'Try another forklift driver at the peak.',
			surge: 'Try a peak-season surge to stress-test the dock.',
		},
		event: (e: ColdStorageEvent): string => {
			const c = (id: CommodityId) => COMMODITIES.en[id];
			switch (e.kind) {
				case 'open':
					return 'Dock opens. Forklift drivers on shift.';
				case 'detention':
					return `Truck ${e.truck} passes 2 h free time ${e.door ? `at door ${e.door}` : 'still waiting in the yard'}. Detention starts`;
				case 'inspection-flagged':
					return `Truck ${e.truck} (${c(e.commodity)}) flagged for inspection`;
				case 'inspection-released':
					return `Truck ${e.truck} (${c(e.commodity)}) released from inspection`;
				case 'warm-pallets':
					return `${c(e.commodity)} from truck ${e.truck} sitting 30+ min on the dock`;
				case 'area-full':
					return `${AREAS.en[e.area]} is full. Pallets are backing up on the dock`;
				case 'forklifts-down':
					return `${e.count} forklifts out of service (battery and maintenance)`;
				case 'forklifts-back':
					return 'Forklifts back in service';
				case 'day-complete':
					return 'Last truck out. Day complete';
			}
		},
	},
	es: {
		...COMMON.es,
		aria: 'Simulación del gemelo digital de un cross-dock refrigerado',
		floorAria:
			'Vista desde arriba de un cross-dock de producto fresco: los camiones hacen fila en el patio y se estacionan en los andenes mientras los montacargas mueven tarimas al túnel de preenfriado, la retención por inspección, la cámara fría y el cuarto templado',
		boardAria: 'Línea de tiempo de los camiones en cada andén, con el tiempo de demora resaltado, y los camiones esperando en el patio',
		clockLabel: 'Hora en el andén',
		newDayTitle: 'Mismos ajustes, otro día de camiones',
		hint: 'Los cambios repiten el día hasta este momento con los mismos camiones, para que vea solo el efecto de su cambio.',
		areas: AREAS.es,
		canvas: {
			fromBridge: 'Desde el puente →',
			chargers: 'Cargadores',
			inboundDoors: 'Andenes de entrada',
			outbound: 'Salida',
			atGate: (n: number) => `+${n} en la caseta`,
			pallets: (used: number, total: number) => `${used}/${total} tarimas`,
			inInspection: (n: number) => plural(n, 'carga en inspección', 'cargas en inspección'),
			yardQueue: 'Fila en el patio',
			yard: 'Patio',
			door: (label: string) => `Andén ${label}`,
		},
		kpis: {
			turn: 'Estancia prom. del camión',
			detention: 'Costo por demoras',
			yard: 'Camiones en el patio',
			excursions: 'Fuera de temperatura',
			dwell: 'Tiempo prom. en el andén',
			utilization: 'Uso de montacargas',
		},
		sub: {
			trucksDone: (done: number, total: number) => `${done} de ${total} camiones terminados`,
			detention: 'Después de 2 h libres, a $75/h',
			yard: 'Camiones esperando andén',
			excursions: (received: number, minutes: number) => `de ${received} tarimas, ${minutes}+ min en el andén`,
			dwell: 'De la descarga al acomodo',
			drivers: (n: number) => plural(n, 'montacarguista', 'montacarguistas'),
		},
		legend: {
			pallets: 'Tarimas:',
			ok: (m: number) => `En el andén < ${m} min`,
			warn: (a: number, b: number) => `${a}–${b} min`,
			bad: (m: number) => `${m}+ min (fuera de temperatura)`,
			precool: 'Preenfriando',
			hold: 'Retenida por inspección',
			cold: 'Inventario en cámara fría',
			mild: 'Inventario en cuarto templado',
			vehicles: 'Vehículos:',
			inbound: 'Entrada',
			outbound: 'Salida',
			forklift: 'Montacargas',
			stripe: 'La franja del remolque muestra el tiempo en sitio frente a las 2 h libres.',
		},
		board: { title: 'Andenes', inbound: 'Entrada en andén', outbound: 'Salida en andén', detention: 'Demora' },
		controls: {
			forklifts: 'Montacarguistas',
			doors: 'Andenes de entrada',
			trucks: 'Camiones de entrada por día',
			arrivals: 'Llegada de camiones',
			priority: 'Prioridad de montacargas',
			inspection: 'Cargas retenidas por inspección',
			precool: 'Túnel de preenfriado (tarimas)',
			surge: 'Temporada alta (+40% camiones)',
			down: (start: string, end: string) => `Dos montacargas fuera de servicio de ${start} a ${end}`,
		},
		patterns: { waves: 'Olas del puente', appointments: 'Con cita' } satisfies Record<ArrivalPattern, string>,
		priorities: { 'unload-first': 'Descargar primero', balanced: 'Equilibrado', 'putaway-first': 'Acomodar primero' } satisfies Record<Priority, string>,
		summary: (turn: string, detention: string, warm: number, ended: string, suggestion: string) =>
			`Estancia promedio de ${turn}, ${detention} en demoras, ${plural(warm, 'tarima', 'tarimas')} se calentaron en el andén, ${ended}. ${suggestion}`,
		ended: (finish: string) => `el último camión sale a las ${finish}`,
		notEnded: 'quedan camiones en sitio a la medianoche',
		suggestions: {
			balanced: 'Pruebe la prioridad Equilibrada y observe las tarimas calientes.',
			appointments: 'Pruebe citas en el andén en lugar de las olas del puente.',
			driver: 'Pruebe otro montacarguista en la hora pico.',
			surge: 'Pruebe la temporada alta para poner el andén a prueba.',
		},
		event: (e: ColdStorageEvent): string => {
			const c = (id: CommodityId) => COMMODITIES.es[id];
			switch (e.kind) {
				case 'open':
					return 'Abre el andén. Montacarguistas en turno.';
				case 'detention':
					return `El camión ${e.truck} pasa las 2 h libres ${e.door ? `en el andén ${e.door}` : 'todavía esperando en el patio'}. Empiezan los cargos por demora`;
				case 'inspection-flagged':
					return `Camión ${e.truck} (${c(e.commodity)}) retenido para inspección`;
				case 'inspection-released':
					return `Camión ${e.truck} (${c(e.commodity)}) liberado de inspección`;
				case 'warm-pallets':
					return `${c(e.commodity)} del camión ${e.truck} llevan 30+ min en el andén`;
				case 'area-full':
					return `${AREAS.es[e.area]}: sin espacio. Las tarimas se acumulan en el andén`;
				case 'forklifts-down':
					return `${e.count} montacargas fuera de servicio (batería y mantenimiento)`;
				case 'forklifts-back':
					return 'Los montacargas vuelven a servicio';
				case 'day-complete':
					return 'Sale el último camión. Día terminado';
			}
		},
	},
};
