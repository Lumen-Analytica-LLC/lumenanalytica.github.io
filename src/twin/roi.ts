import type { Industry } from '../config/contact';
import type { Lang } from '../i18n';

/** ROI calculator models for the industry landing pages. Runs in the page; nothing is sent anywhere. */

type Text = Record<Lang, string>;

export interface RoiInput {
	name: string;
	label: Text;
	hint?: Text;
	prefix?: string;
	value: number;
	min: number;
	max: number;
	step: number;
}

export interface RoiOutput {
	key: string;
	label: Text;
	format: 'money' | 'count';
}

export interface RoiModel {
	inputs: RoiInput[];
	outputs: RoiOutput[];
	/** Who the improvement assumption is measured for, e.g. "your clinic". */
	subject: Text;
	/** Industry pre-selected on the contact form. */
	industry: Industry;
	/** First line of the summary attached to the inquiry. */
	summaryTitle: Text;
	/** `improvement` is a fraction (0.25 = 25%). Must return every output key plus `total`. */
	compute: (n: (name: string) => number, improvement: number) => Record<string, number>;
}

export const ROI_MODELS = {
	clinic: {
		subject: { en: 'your clinic', es: 'su clínica' },
		industry: 'healthcare',
		summaryTitle: { en: 'Clinic ROI estimate', es: 'Estimación de retorno para la clínica' },
		inputs: [
			{
				name: 'lostPerDay',
				label: { en: 'Patients lost per day', es: 'Pacientes perdidos por día' },
				hint: {
					en: 'Walk-ins who leave, plus visits you turn away when the day runs long',
					es: 'Pacientes sin cita que se van, más las consultas que rechaza cuando el día se alarga',
				},
				value: 3,
				min: 0,
				max: 50,
				step: 0.5,
			},
			{ name: 'revenuePerVisit', label: { en: 'Revenue per visit', es: 'Ingreso por consulta' }, prefix: '$', value: 145, min: 0, max: 2000, step: 5 },
			{
				name: 'overtimeMinutes',
				label: { en: 'Overtime per day (minutes)', es: 'Tiempo extra por día (minutos)' },
				hint: { en: 'How long past close the last patient leaves', es: 'Cuánto después del cierre sale el último paciente' },
				value: 40,
				min: 0,
				max: 300,
				step: 5,
			},
			{ name: 'staffOnOvertime', label: { en: 'Staff kept on for overtime', es: 'Personal que se queda en tiempo extra' }, value: 6, min: 0, max: 100, step: 1 },
			{ name: 'hourlyCost', label: { en: 'Loaded hourly staff cost', es: 'Costo por hora del personal (con prestaciones)' }, prefix: '$', value: 38, min: 0, max: 300, step: 1 },
			{ name: 'workingDays', label: { en: 'Clinic days per year', es: 'Días de clínica por año' }, value: 250, min: 1, max: 365, step: 1 },
		],
		outputs: [
			{ key: 'visits', label: { en: 'Recovered visits', es: 'Consultas recuperadas' }, format: 'count' },
			{ key: 'revenue', label: { en: 'Revenue from recovered visits', es: 'Ingresos por consultas recuperadas' }, format: 'money' },
			{ key: 'overtime', label: { en: 'Overtime avoided (at 1.5×)', es: 'Tiempo extra evitado (a 1.5×)' }, format: 'money' },
		],
		compute: (n, improvement) => {
			const days = n('workingDays');
			const visits = n('lostPerDay') * improvement * days;
			const revenue = visits * n('revenuePerVisit');
			const overtime = (n('overtimeMinutes') / 60) * n('staffOnOvertime') * n('hourlyCost') * 1.5 * improvement * days;
			return { visits, revenue, overtime, total: revenue + overtime };
		},
	},
	'cold-chain': {
		subject: { en: 'your dock', es: 'su andén' },
		industry: 'cold-chain',
		summaryTitle: { en: 'Cold chain ROI estimate', es: 'Estimación de retorno para la cadena de frío' },
		inputs: [
			{ name: 'trucksPerDay', label: { en: 'Inbound and outbound trucks per day', es: 'Camiones de entrada y salida por día' }, value: 60, min: 0, max: 1000, step: 1 },
			{ name: 'detentionShare', label: { en: 'Trucks that run into detention (%)', es: 'Camiones que generan cargos por demora (%)' }, value: 20, min: 0, max: 100, step: 1 },
			{ name: 'detentionHours', label: { en: 'Average detention per truck (hours)', es: 'Demora promedio por camión (horas)' }, value: 1.5, min: 0, max: 24, step: 0.25 },
			{ name: 'detentionRate', label: { en: 'Detention rate per hour', es: 'Cargo por demora por hora' }, prefix: '$', value: 75, min: 0, max: 500, step: 5 },
			{
				name: 'palletsLostPerWeek',
				label: { en: 'Pallets rejected or downgraded per week', es: 'Tarimas rechazadas o degradadas por semana' },
				hint: {
					en: 'Claims, rejections and markdowns tied to time out of temperature',
					es: 'Reclamos, rechazos y descuentos por tiempo fuera de temperatura',
				},
				value: 2,
				min: 0,
				max: 500,
				step: 0.5,
			},
			{ name: 'palletValue', label: { en: 'Average value per pallet', es: 'Valor promedio por tarima' }, prefix: '$', value: 2500, min: 0, max: 100000, step: 100 },
			{
				name: 'overtimeHours',
				label: { en: 'Dock overtime hours per day', es: 'Horas extra en el andén por día' },
				hint: { en: 'Across all forklift drivers and dock staff', es: 'Entre todos los montacarguistas y el personal del andén' },
				value: 8,
				min: 0,
				max: 500,
				step: 1,
			},
			{ name: 'hourlyCost', label: { en: 'Loaded hourly labor cost', es: 'Costo laboral por hora (con prestaciones)' }, prefix: '$', value: 26, min: 0, max: 300, step: 1 },
			{ name: 'workingDays', label: { en: 'Operating days per year', es: 'Días de operación por año' }, value: 300, min: 1, max: 365, step: 1 },
		],
		outputs: [
			{ key: 'detention', label: { en: 'Detention avoided', es: 'Cargos por demora evitados' }, format: 'money' },
			{ key: 'product', label: { en: 'Product loss avoided', es: 'Pérdida de producto evitada' }, format: 'money' },
			{ key: 'overtime', label: { en: 'Overtime avoided (at 1.5×)', es: 'Tiempo extra evitado (a 1.5×)' }, format: 'money' },
		],
		compute: (n, improvement) => {
			const days = n('workingDays');
			const detention =
				n('trucksPerDay') * (n('detentionShare') / 100) * n('detentionHours') * n('detentionRate') * days * improvement;
			const product = n('palletsLostPerWeek') * n('palletValue') * 52 * improvement;
			const overtime = n('overtimeHours') * n('hourlyCost') * 1.5 * days * improvement;
			return { detention, product, overtime, total: detention + product + overtime };
		},
	},
} satisfies Record<string, RoiModel>;

export type RoiModelName = keyof typeof ROI_MODELS;
