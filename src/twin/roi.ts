import type { Industry } from '../config/contact';

/** ROI calculator models for the industry landing pages. Runs in the page; nothing is sent anywhere. */

export interface RoiInput {
	name: string;
	label: string;
	hint?: string;
	prefix?: string;
	value: number;
	min: number;
	max: number;
	step: number;
}

export interface RoiOutput {
	key: string;
	label: string;
	format: 'money' | 'count';
}

export interface RoiModel {
	inputs: RoiInput[];
	outputs: RoiOutput[];
	/** Who the improvement assumption is measured for, e.g. "your clinic". */
	subject: string;
	/** Industry pre-selected on the contact form. */
	industry: Industry;
	/** First line of the summary attached to the inquiry. */
	summaryTitle: string;
	/** `improvement` is a fraction (0.25 = 25%). Must return every output key plus `total`. */
	compute: (n: (name: string) => number, improvement: number) => Record<string, number>;
}

export const ROI_MODELS = {
	clinic: {
		subject: 'your clinic',
		industry: 'healthcare',
		summaryTitle: 'Clinic ROI estimate',
		inputs: [
			{ name: 'lostPerDay', label: 'Patients lost per day', hint: 'Walk-ins who leave, plus visits you turn away when the day runs long', value: 3, min: 0, max: 50, step: 0.5 },
			{ name: 'revenuePerVisit', label: 'Revenue per visit', prefix: '$', value: 145, min: 0, max: 2000, step: 5 },
			{ name: 'overtimeMinutes', label: 'Overtime per day (minutes)', hint: 'How long past close the last patient leaves', value: 40, min: 0, max: 300, step: 5 },
			{ name: 'staffOnOvertime', label: 'Staff kept on for overtime', value: 6, min: 0, max: 100, step: 1 },
			{ name: 'hourlyCost', label: 'Loaded hourly staff cost', prefix: '$', value: 38, min: 0, max: 300, step: 1 },
			{ name: 'workingDays', label: 'Clinic days per year', value: 250, min: 1, max: 365, step: 1 },
		],
		outputs: [
			{ key: 'visits', label: 'Recovered visits', format: 'count' },
			{ key: 'revenue', label: 'Revenue from recovered visits', format: 'money' },
			{ key: 'overtime', label: 'Overtime avoided (at 1.5×)', format: 'money' },
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
		subject: 'your dock',
		industry: 'cold-chain',
		summaryTitle: 'Cold chain ROI estimate',
		inputs: [
			{ name: 'trucksPerDay', label: 'Inbound and outbound trucks per day', value: 60, min: 0, max: 1000, step: 1 },
			{ name: 'detentionShare', label: 'Trucks that run into detention (%)', value: 20, min: 0, max: 100, step: 1 },
			{ name: 'detentionHours', label: 'Average detention per truck (hours)', value: 1.5, min: 0, max: 24, step: 0.25 },
			{ name: 'detentionRate', label: 'Detention rate per hour', prefix: '$', value: 75, min: 0, max: 500, step: 5 },
			{ name: 'palletsLostPerWeek', label: 'Pallets rejected or downgraded per week', hint: 'Claims, rejections and markdowns tied to time out of temperature', value: 2, min: 0, max: 500, step: 0.5 },
			{ name: 'palletValue', label: 'Average value per pallet', prefix: '$', value: 2500, min: 0, max: 100000, step: 100 },
			{ name: 'overtimeHours', label: 'Dock overtime hours per day', hint: 'Across all forklift drivers and dock staff', value: 8, min: 0, max: 500, step: 1 },
			{ name: 'hourlyCost', label: 'Loaded hourly labor cost', prefix: '$', value: 26, min: 0, max: 300, step: 1 },
			{ name: 'workingDays', label: 'Operating days per year', value: 300, min: 1, max: 365, step: 1 },
		],
		outputs: [
			{ key: 'detention', label: 'Detention avoided', format: 'money' },
			{ key: 'product', label: 'Product loss avoided', format: 'money' },
			{ key: 'overtime', label: 'Overtime avoided (at 1.5×)', format: 'money' },
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
