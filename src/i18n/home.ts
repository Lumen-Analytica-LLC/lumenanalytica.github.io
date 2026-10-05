import type { Lang } from '.';

export const HOME = {
	en: {
		meta: {
			title: 'Lumen Analytica | Operational Digital Twins for South Texas',
			description:
				'Lumen Analytica builds digital twins of clinics, cold storage docks and warehouses across the Rio Grande Valley and South Texas, so you can test schedules, staffing and layouts before you change them.',
		},
		eyebrow: 'Operational digital twins · Rio Grande Valley & South Texas',
		h1: "See your operation's day before it happens.",
		lede: "We build working models of clinics, cold storage docks and warehouses, so you can test schedules, staffing and layouts before you change them, and know what they'll do to waits, truck turns and costs.",
		seeWhat: 'See what we model',
		tabs: { label: 'Live twin', clinic: 'Clinic', cold: 'Cold chain' },
		industries: {
			title: 'Where waiting costs money',
			intro: "Patients waiting for a provider and trucks waiting for a door are the same problem: arrivals, limited capacity and a schedule. That's what our twins model.",
			learnMore: 'Learn more',
			items: [
				{
					title: 'Clinics and hospitals',
					body: 'Waiting rooms, provider schedules, exam rooms and walk-ins. Find the template, staffing and room changes that shorten waits without adding hours.',
					points: ['Shorter waits to see a provider', 'Fewer patients leaving without being seen', 'Days that end on time'],
					href: '/healthcare/',
					demo: '/healthcare/demo/',
					demoLabel: 'Try the clinic twin',
				},
				{
					title: 'Cold storage and 3PL',
					body: 'Yard queues, dock doors, forklifts, pre-cooling and inspections. Find the appointment, staffing and put-away rules that turn trucks faster and keep product cold.',
					points: ['Faster truck turns, less detention', 'Fewer pallets warming on the dock', 'A plan that survives peak season'],
					href: '/cold-chain/',
					demo: '/cold-chain/demo/',
					demoLabel: 'Try the cross-dock twin',
				},
			],
			education: {
				title: 'Education',
				body: "Registration lines, financial aid and advising offices, and campus operations follow the same pattern. We're looking for campus partners for research and student analyst projects.",
				cta: 'Talk to us about partnering',
			},
		},
		results: {
			title: 'What the demo twins show',
			intro: 'The same simulated day, before and after one set of changes. These are results from our demo twins, not client results.',
			// Averages from the demo twins' own runs (20 simulated clinic days, 8 simulated dock days).
			items: [
				{ before: '21 min', after: '15 min', label: 'Average wait to see a provider', note: 'Clinic twin: hourly block booking → staggered template' },
				{ before: '47 min', after: '35 min', label: '90th percentile wait', note: 'Same clinic, same patients' },
				{ before: '$1,790', after: '$24', label: 'Detention per day', note: 'Cross-dock twin: bridge waves → appointments, balanced priority, 8 drivers' },
				{ before: '261', after: '42', label: 'Pallets 30+ min on the dock', note: 'Same dock, same trucks' },
			],
		},
		reasons: {
			title: 'Why a twin, not another dashboard',
			intro: 'A dashboard tells you what happened. A twin shows you what would happen.',
			items: [
				{ title: 'Test before you change', body: 'Try a new schedule, staffing plan or rule on the twin first. Keep the changes that work; skip the ones that would have backfired.' },
				{ title: 'Fair comparisons', body: 'Every scenario replays the same day with the same patients or trucks, so the only difference you see is the change you made.' },
				{ title: 'Built from your own data', body: 'Schedules, timestamps and layouts you already have. No new software to install, and nothing touches your systems unless you want it to.' },
			],
		},
		build: {
			title: 'How we build a twin',
			intro: "Five steps, from walking your floor to keeping the model current. Each one draws on a service we've offered for years.",
			link: 'How we do it',
			items: [
				{ title: 'Assess', body: 'Walk the floor or dock, agree on the problem and the numbers that matter.', service: 'operations-research' },
				{ title: 'Connect', body: 'Pull schedules, timestamps and layouts into a clean, governed dataset.', service: 'data-platform' },
				{ title: 'Model', body: 'Build and calibrate the twin until it matches what really happened.', service: 'operations-research' },
				{ title: 'Optimize', body: 'Test changes with your team and price the impact.', service: 'accounting-operations' },
				{ title: 'Operate', body: 'Keep the twin current for re-planning before each season.', service: 'software-development' },
			],
		},
		region: {
			title: 'Local to South Texas',
			body: 'We work with clinics, health centers, cold storage operators and 3PLs across the Rio Grande Valley, from Brownsville and Harlingen to McAllen, Pharr and Edinburg, and up the corridor to San Antonio and Austin. We come to you: the best twins start with walking the floor or the dock with the people who run it.',
			label: 'Service area',
			places: ['Rio Grande Valley', 'San Antonio', 'Austin'],
		},
	},
	es: {
		meta: {
			title: 'Lumen Analytica | Gemelos digitales operativos para el sur de Texas',
			description:
				'Lumen Analytica construye gemelos digitales de clínicas, andenes de almacenes frigoríficos y almacenes en el Valle del Río Grande y el sur de Texas, para que pueda probar agendas, personal y distribución antes de cambiarlos.',
		},
		eyebrow: 'Gemelos digitales operativos · Valle del Río Grande y sur de Texas',
		h1: 'Vea el día de su operación antes de que suceda.',
		lede: 'Construimos modelos funcionales de clínicas, andenes refrigerados y almacenes, para que pueda probar agendas, personal y distribución antes de cambiarlos, y saber qué efecto tendrán en las esperas, la estancia de los camiones y los costos.',
		seeWhat: 'Vea lo que modelamos',
		tabs: { label: 'Gemelo en vivo', clinic: 'Clínica', cold: 'Cadena de frío' },
		industries: {
			title: 'Donde esperar cuesta dinero',
			intro: 'Un paciente esperando al médico y un camión esperando andén son el mismo problema: llegadas, capacidad limitada y una agenda. Eso es lo que modelan nuestros gemelos.',
			learnMore: 'Más información',
			items: [
				{
					title: 'Clínicas y hospitales',
					body: 'Salas de espera, agendas de médicos, consultorios y pacientes sin cita. Encuentre los cambios de agenda, personal y consultorios que reducen la espera sin alargar el día.',
					points: ['Menos espera para ver al médico', 'Menos pacientes que se van sin ser atendidos', 'Días que terminan a tiempo'],
					href: '/healthcare/',
					demo: '/healthcare/demo/',
					demoLabel: 'Pruebe el gemelo de la clínica',
				},
				{
					title: 'Almacenes frigoríficos y 3PL',
					body: 'Filas en el patio, andenes, montacargas, preenfriado e inspecciones. Encuentre las reglas de citas, personal y acomodo que despachan más rápido los camiones y mantienen frío el producto.',
					points: ['Camiones más rápidos, menos cargos por demora', 'Menos tarimas calentándose en el andén', 'Un plan que aguanta la temporada alta'],
					href: '/cold-chain/',
					demo: '/cold-chain/demo/',
					demoLabel: 'Pruebe el gemelo del cross-dock',
				},
			],
			education: {
				title: 'Educación',
				body: 'Las filas de inscripción, las oficinas de ayuda financiera y asesoría, y las operaciones del campus siguen el mismo patrón. Buscamos instituciones aliadas para proyectos de investigación y de analistas estudiantes.',
				cta: 'Hablemos de una alianza',
			},
		},
		results: {
			title: 'Lo que muestran los gemelos de demostración',
			intro: 'El mismo día simulado, antes y después de un conjunto de cambios. Son resultados de nuestros gemelos de demostración, no de clientes.',
			items: [
				{ before: '21 min', after: '15 min', label: 'Espera promedio para ver al médico', note: 'Gemelo de la clínica: bloques por hora → agenda escalonada' },
				{ before: '47 min', after: '35 min', label: 'Espera del percentil 90', note: 'La misma clínica, los mismos pacientes' },
				{ before: '$1,790', after: '$24', label: 'Cargos por demora por día', note: 'Gemelo del cross-dock: olas del puente → citas, prioridad equilibrada, 8 montacarguistas' },
				{ before: '261', after: '42', label: 'Tarimas 30+ min en el andén', note: 'El mismo andén, los mismos camiones' },
			],
		},
		reasons: {
			title: 'Por qué un gemelo y no otro tablero',
			intro: 'Un tablero le dice lo que pasó. Un gemelo le muestra lo que pasaría.',
			items: [
				{ title: 'Pruebe antes de cambiar', body: 'Pruebe primero en el gemelo una nueva agenda, plan de personal o regla. Quédese con los cambios que funcionan y evite los que habrían salido mal.' },
				{ title: 'Comparaciones justas', body: 'Cada escenario repite el mismo día con los mismos pacientes o camiones, así que la única diferencia que ve es el cambio que usted hizo.' },
				{ title: 'Hecho con sus propios datos', body: 'Agendas, horarios y distribuciones que ya tiene. Sin software nuevo que instalar, y nada toca sus sistemas a menos que usted lo quiera.' },
			],
		},
		build: {
			title: 'Cómo construimos un gemelo',
			intro: 'Cinco pasos, desde recorrer su piso hasta mantener el modelo al día. Cada uno se apoya en un servicio que ofrecemos desde hace años.',
			link: 'Cómo lo hacemos',
			items: [
				{ title: 'Evaluar', body: 'Recorremos el piso o el andén y acordamos el problema y los números que importan.', service: 'operations-research' },
				{ title: 'Conectar', body: 'Reunimos agendas, horarios y distribuciones en un conjunto de datos limpio y bien gobernado.', service: 'data-platform' },
				{ title: 'Modelar', body: 'Construimos y calibramos el gemelo hasta que coincida con lo que realmente pasó.', service: 'operations-research' },
				{ title: 'Optimizar', body: 'Probamos cambios con su equipo y les ponemos precio.', service: 'accounting-operations' },
				{ title: 'Operar', body: 'Mantenemos el gemelo al día para replanear antes de cada temporada.', service: 'software-development' },
			],
		},
		region: {
			title: 'Del sur de Texas',
			body: 'Trabajamos con clínicas, centros de salud, almacenes frigoríficos y empresas 3PL en todo el Valle del Río Grande, de Brownsville y Harlingen a McAllen, Pharr y Edinburg, y por el corredor hasta San Antonio y Austin. Vamos a donde está usted: los mejores gemelos empiezan recorriendo el piso o el andén con la gente que lo opera.',
			label: 'Área de servicio',
			places: ['Valle del Río Grande', 'San Antonio', 'Austin'],
		},
	},
} satisfies Record<Lang, unknown>;
