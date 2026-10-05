import type { Lang } from '.';

export interface DemoContent {
	meta: { title: string; description: string };
	title: string;
	tagline: string;
	disclaimer: string;
	cta: string;
}

export const DEMOS: Record<'healthcare' | 'cold-chain', Record<Lang, DemoContent>> = {
	healthcare: {
		en: {
			meta: {
				title: 'Clinic Digital Twin Demo | Lumen Analytica',
				description:
					'Watch a simulated primary care clinic run in real time, then change schedules, staffing and walk-in demand to see the effect on patient wait times and provider availability.',
			},
			title: 'A day in your clinic, before it happens',
			tagline:
				'This is a digital twin of a four-provider community clinic: lots of no-shows, double-booking to make up for them, and a steady stream of walk-ins. Patients check in, wait, get roomed and see their provider. Change the schedule or staffing and the same day replays, so you see exactly what your change would do.',
			disclaimer:
				'All patients and providers are synthetic. Arrival patterns, visit lengths and no-shows are drawn from realistic distributions; a twin of your clinic is calibrated to your own scheduling and visit data.',
			cta: 'Want this for your clinic?',
		},
		es: {
			meta: {
				title: 'Demostración: gemelo digital de una clínica | Lumen Analytica',
				description:
					'Vea una clínica de atención primaria simulada en tiempo real y cambie la agenda, el personal y los pacientes sin cita para ver el efecto en los tiempos de espera y la disponibilidad de los médicos.',
			},
			title: 'Un día en su clínica, antes de que suceda',
			tagline:
				'Este es el gemelo digital de una clínica comunitaria con cuatro médicos: muchas inasistencias, citas dobles para compensarlas y un flujo constante de pacientes sin cita. Los pacientes se registran, esperan, pasan al consultorio y ven a su médico. Cambie la agenda o el personal y el mismo día se repite, para que vea exactamente qué haría su cambio.',
			disclaimer:
				'Todos los pacientes y médicos son ficticios. Los patrones de llegada, la duración de las consultas y las inasistencias siguen distribuciones realistas; el gemelo de su clínica se calibra con sus propios datos de agenda y consultas.',
			cta: '¿Quiere esto para su clínica?',
		},
	},
	'cold-chain': {
		en: {
			meta: {
				title: 'Cold Storage Digital Twin Demo | Lumen Analytica',
				description:
					'Watch a simulated produce cross-dock run in real time, then change forklift staffing, dock doors, arrival patterns and priorities to see the effect on truck turn time, detention and cold chain exposure.',
			},
			title: 'Every truck, every pallet, before the season hits',
			tagline:
				'This is a digital twin of a produce cross-dock near the bridge. Reefer trucks arrive in waves, back into the dock, and forklifts race to unload, pre-cool and put away before product warms up. Change the staffing or the rules and the same day replays, so you see exactly what your change would do.',
			disclaimer:
				'All trucks, loads and inventory are synthetic. Arrival waves, load sizes, inspection rates and pre-cooling times are illustrative; a twin of your facility is calibrated to your own yard, dock and warehouse data. Detention is shown at an assumed $75 per hour after two hours of free time.',
			cta: 'Want this for your dock?',
		},
		es: {
			meta: {
				title: 'Demostración: gemelo digital de un almacén frigorífico | Lumen Analytica',
				description:
					'Vea un cross-dock de producto fresco simulado en tiempo real y cambie montacarguistas, andenes, llegadas y prioridades para ver el efecto en la estancia de los camiones, los cargos por demora y la exposición de la cadena de frío.',
			},
			title: 'Cada camión, cada tarima, antes de la temporada',
			tagline:
				'Este es el gemelo digital de un cross-dock de producto fresco cerca del puente. Los camiones refrigerados llegan en olas, se estacionan en el andén y los montacargas corren a descargar, preenfriar y acomodar antes de que el producto se caliente. Cambie el personal o las reglas y el mismo día se repite, para que vea exactamente qué haría su cambio.',
			disclaimer:
				'Todos los camiones, cargas e inventario son ficticios. Las olas de llegada, el tamaño de las cargas, las inspecciones y los tiempos de preenfriado son ilustrativos; el gemelo de su instalación se calibra con sus propios datos de patio, andén y almacén. Los cargos por demora se calculan con un supuesto de $75 por hora después de dos horas libres.',
			cta: '¿Quiere esto para su andén?',
		},
	},
};
