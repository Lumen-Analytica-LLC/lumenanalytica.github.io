import type { Lang } from '.';

export interface LandingContent {
	meta: { title: string; description: string };
	eyebrow: string;
	h1: string;
	lede: string;
	ctaDemo: string;
	ctaAssessment: string;
	problems: { title: string; intro: string; items: { title: string; body: string }[] };
	steps: { title: string; intro: string; items: { title: string; body: string }[] };
	scenarios: { title: string; intro: string; items: { question: string; href: string }[] };
	roi: { title: string; intro: string };
	pilot: { title: string; intro: string; items: { week: string; title: string; body: string }[] };
	faqs: { title: string; items: { q: string; a: string }[] };
	closing: { title: string; body: string; demo: string };
}

export const HEALTHCARE: Record<Lang, LandingContent> = {
	en: {
		meta: {
			title: 'Clinic Digital Twins | Lumen Analytica',
			description:
				'Digital twins for clinics and hospital departments. Test schedule, staffing and room changes on a live model of your clinic before you make them.',
		},
		eyebrow: 'Digital twins for healthcare operations',
		h1: 'Shorter waits. Fuller days. Fewer late nights.',
		lede: "We build a working model of your clinic, a digital twin, so you can test schedule, staffing and room changes before you make them, and know what they'll do to wait times and throughput.",
		ctaDemo: 'Try the clinic twin',
		ctaAssessment: 'Book a twin assessment',
		problems: {
			title: 'Sound familiar?',
			intro: "Most clinic bottlenecks aren't a staffing problem. They come from how the day is scheduled.",
			items: [
				{ title: 'The waiting room is full by 10 a.m.', body: 'Front-loaded templates and double-booking stack patients up early, and the day never recovers.' },
				{ title: 'Providers are idle, then slammed', body: 'Quiet first slots, a mid-morning crush, and rooms sitting full of patients waiting on the same provider.' },
				{ title: 'Walk-ins give up and leave', body: 'Every patient who walks out is lost revenue, and a patient who may not come back.' },
				{ title: 'The day runs past close', body: 'Overtime for front desk, MAs and providers becomes the norm, and so does burnout.' },
			],
		},
		steps: {
			title: 'How a clinic twin works',
			intro: 'A dashboard tells you what happened. A twin shows you what would happen.',
			items: [
				{ title: 'Mirror', body: 'We build a model of your clinic from your own scheduling and visit-timestamp data: rooms, providers, templates, arrival patterns and visit lengths.' },
				{ title: 'Test', body: 'Your team tries changes on the twin first: new templates, staffing, room assignments or walk-in policies. Every scenario replays the same day, so comparisons are fair.' },
				{ title: 'Act', body: 'You get the changes worth making, with the expected effect on wait times, throughput and overtime, and a way to check the result after rollout.' },
			],
		},
		scenarios: {
			title: 'Questions you can answer before Monday',
			intro: 'Each one opens the demo twin with that change applied. The same patients, the same day: only your change is different.',
			items: [
				{ question: 'What if we switch from hourly blocks to a staggered template?', href: '/healthcare/demo/?t=staggered' },
				{ question: 'What happens when a provider gets pulled away mid-morning?', href: '/healthcare/demo/?d=1&at=0945' },
				{ question: 'Can we absorb a walk-in surge without losing patients?', href: '/healthcare/demo/?wi=5' },
				{ question: 'Is another exam room worth it?', href: '/healthcare/demo/?r=8' },
				{ question: 'What does double-booking actually cost us?', href: '/healthcare/demo/?db=0' },
				{ question: 'Do we need another provider, or a better schedule?', href: '/healthcare/demo/?p=5' },
			],
		},
		roi: {
			title: "What's a shorter day worth?",
			intro: 'Put in your own numbers for a rough annual estimate. The pilot replaces these assumptions with measured results.',
		},
		pilot: {
			title: 'A 30-day pilot',
			intro: 'One clinic, one month, a fixed scope. You finish with a calibrated twin and a short list of changes worth making.',
			items: [
				{ week: 'Week 1', title: 'Connect', body: 'Kickoff, then a de-identified extract of appointments and visit timestamps. Most EHR and practice management systems can export this as a standard report.' },
				{ week: 'Week 2', title: 'Build and calibrate', body: 'We build the twin of your clinic and check it against a few real days until waits and throughput match what actually happened.' },
				{ week: 'Week 3', title: 'Test with your team', body: 'Working sessions with your operations leads to try the changes you have been debating, plus a few you have not.' },
				{ week: 'Week 4', title: 'Readout', body: 'Recommended changes, expected impact, and a simple plan to measure the result after rollout. You keep the twin.' },
			],
		},
		faqs: {
			title: 'Common questions',
			items: [
				{ q: 'Do we need to install new software?', a: 'No. The pilot runs on data exports and a hosted twin your team can open in a browser. Nothing touches your EHR.' },
				{ q: 'What data do you need?', a: 'Appointment schedules and visit timestamps (check-in, roomed, provider in, checkout) for a few representative weeks, plus your room and staffing setup. We ask for the minimum needed and prefer de-identified extracts.' },
				{ q: 'How is this different from a dashboard?', a: 'A dashboard shows what already happened. A twin lets you see what would happen if you changed something, before you change it.' },
				{ q: 'Does it work for urgent care, specialty clinics or hospital departments?', a: 'Yes. Anywhere patients arrive, wait and compete for rooms and providers. Urgent care, imaging, infusion centers and emergency department fast-track all follow the same pattern.' },
			],
		},
		closing: {
			title: "See your clinic's day before it happens",
			body: "Tell us about your clinic and the problem you'd most like to solve. We'll show you what a twin of it would look like.",
			demo: 'Try the demo first',
		},
	},
	es: {
		meta: {
			title: 'Gemelos digitales para clínicas | Lumen Analytica',
			description:
				'Gemelos digitales para clínicas y departamentos hospitalarios. Pruebe cambios de agenda, personal y consultorios en un modelo vivo de su clínica antes de hacerlos.',
		},
		eyebrow: 'Gemelos digitales para operaciones de salud',
		h1: 'Menos espera. Días más productivos. Menos horas extra.',
		lede: 'Construimos un modelo funcional de su clínica, un gemelo digital, para que pueda probar cambios de agenda, personal y consultorios antes de hacerlos, y saber qué efecto tendrán en los tiempos de espera y en la cantidad de pacientes atendidos.',
		ctaDemo: 'Pruebe el gemelo de la clínica',
		ctaAssessment: 'Agende una evaluación',
		problems: {
			title: '¿Le suena familiar?',
			intro: 'La mayoría de los cuellos de botella en una clínica no son un problema de personal. Vienen de cómo se agenda el día.',
			items: [
				{ title: 'La sala de espera está llena a las 10 a. m.', body: 'Las agendas cargadas al inicio y las citas dobles acumulan pacientes temprano, y el día nunca se recupera.' },
				{ title: 'Médicos sin pacientes y luego saturados', body: 'Primeras citas tranquilas, una avalancha a media mañana y consultorios llenos de pacientes esperando al mismo médico.' },
				{ title: 'Los pacientes sin cita se cansan y se van', body: 'Cada paciente que se va es un ingreso perdido, y un paciente que quizá no regrese.' },
				{ title: 'El día termina después del cierre', body: 'Las horas extra de recepción, asistentes y médicos se vuelven costumbre, y el desgaste también.' },
			],
		},
		steps: {
			title: 'Cómo funciona el gemelo de una clínica',
			intro: 'Un tablero le dice lo que pasó. Un gemelo le muestra lo que pasaría.',
			items: [
				{ title: 'Reflejar', body: 'Construimos un modelo de su clínica con sus propios datos de agenda y horarios de consulta: consultorios, médicos, plantillas de citas, patrones de llegada y duración de las consultas.' },
				{ title: 'Probar', body: 'Su equipo prueba los cambios primero en el gemelo: nuevas plantillas, personal, asignación de consultorios o reglas para pacientes sin cita. Cada escenario repite el mismo día, así que las comparaciones son justas.' },
				{ title: 'Actuar', body: 'Usted recibe los cambios que vale la pena hacer, con su efecto esperado en tiempos de espera, pacientes atendidos y horas extra, y una forma de medir el resultado después de implementarlos.' },
			],
		},
		scenarios: {
			title: 'Preguntas que puede responder antes del lunes',
			intro: 'Cada una abre el gemelo de demostración con ese cambio aplicado. Los mismos pacientes, el mismo día: solo cambia lo que usted cambió.',
			items: [
				{ question: '¿Y si pasamos de bloques por hora a una agenda escalonada?', href: '/healthcare/demo/?t=staggered' },
				{ question: '¿Qué pasa si un médico tiene que salir a media mañana?', href: '/healthcare/demo/?d=1&at=0945' },
				{ question: '¿Podemos absorber más pacientes sin cita sin perder ninguno?', href: '/healthcare/demo/?wi=5' },
				{ question: '¿Vale la pena otro consultorio?', href: '/healthcare/demo/?r=8' },
				{ question: '¿Cuánto nos cuestan realmente las citas dobles?', href: '/healthcare/demo/?db=0' },
				{ question: '¿Necesitamos otro médico o una mejor agenda?', href: '/healthcare/demo/?p=5' },
			],
		},
		roi: {
			title: '¿Cuánto vale un día más corto?',
			intro: 'Ingrese sus propios números para una estimación anual aproximada. El piloto reemplaza estos supuestos con resultados medidos.',
		},
		pilot: {
			title: 'Un piloto de 30 días',
			intro: 'Una clínica, un mes, un alcance fijo. Termina con un gemelo calibrado y una lista corta de cambios que vale la pena hacer.',
			items: [
				{ week: 'Semana 1', title: 'Conectar', body: 'Arranque del proyecto y un extracto anonimizado de citas y horarios de consulta. La mayoría de los sistemas de expediente clínico y de administración de consultorios pueden exportarlo como un reporte estándar.' },
				{ week: 'Semana 2', title: 'Construir y calibrar', body: 'Construimos el gemelo de su clínica y lo comparamos con algunos días reales hasta que las esperas y los pacientes atendidos coincidan con lo que realmente pasó.' },
				{ week: 'Semana 3', title: 'Probar con su equipo', body: 'Sesiones de trabajo con sus líderes de operación para probar los cambios que han estado discutiendo, y algunos que no se les habían ocurrido.' },
				{ week: 'Semana 4', title: 'Resultados', body: 'Cambios recomendados, impacto esperado y un plan sencillo para medir el resultado después de implementarlos. El gemelo se queda con usted.' },
			],
		},
		faqs: {
			title: 'Preguntas frecuentes',
			items: [
				{ q: '¿Tenemos que instalar software nuevo?', a: 'No. El piloto funciona con datos exportados y un gemelo en línea que su equipo puede abrir en el navegador. No se toca su expediente clínico electrónico.' },
				{ q: '¿Qué datos necesitan?', a: 'Agendas de citas y horarios de consulta (registro, ingreso al consultorio, entrada del médico, salida) de algunas semanas representativas, además de cómo están organizados sus consultorios y su personal. Pedimos lo mínimo necesario y preferimos extractos anonimizados.' },
				{ q: '¿En qué se diferencia de un tablero de indicadores?', a: 'Un tablero muestra lo que ya pasó. Un gemelo le permite ver qué pasaría si cambia algo, antes de cambiarlo.' },
				{ q: '¿Funciona para urgencias, clínicas de especialidad o departamentos de hospital?', a: 'Sí. En cualquier lugar donde los pacientes llegan, esperan y compiten por consultorios y médicos. Urgencias, imagenología, centros de infusión y la vía rápida de emergencias siguen el mismo patrón.' },
			],
		},
		closing: {
			title: 'Vea el día de su clínica antes de que suceda',
			body: 'Cuéntenos sobre su clínica y el problema que más le gustaría resolver. Le mostraremos cómo se vería un gemelo de ella.',
			demo: 'Pruebe primero la demostración',
		},
	},
};

export const COLD_CHAIN: Record<Lang, LandingContent> = {
	en: {
		meta: {
			title: 'Cold Chain Digital Twins | Lumen Analytica',
			description:
				'Digital twins for cold storage, produce cross-docks and 3PL warehouses. Test dock schedules, forklift staffing and put-away rules on a live model of your facility before peak season.',
		},
		eyebrow: 'Digital twins for cold chain and 3PL operations',
		h1: 'Faster turns. Colder pallets. Less detention.',
		lede: "We build a working model of your dock, a digital twin, so you can test door schedules, forklift staffing and put-away rules before the season hits, and know what they'll do to truck turns, detention and product temperature.",
		ctaDemo: 'Try the cross-dock twin',
		ctaAssessment: 'Book a dock assessment',
		problems: {
			title: 'Sound familiar?',
			intro: "Most dock problems aren't a headcount problem. They come from when trucks arrive and what the crew works on first.",
			items: [
				{ title: 'The yard is full by 10 a.m.', body: 'Trucks come off the bridge in waves, every door fills at once, and the detention clock starts on the ones still waiting.' },
				{ title: 'Pallets sit warm on the dock', body: 'When the crew races to empty trailers, put-away falls behind, and product loses shelf life a few degrees at a time.' },
				{ title: 'Pre-cool and inspection jam everything', body: 'A full tunnel or a held load blocks the pallets behind it, and the backup spreads across the dock.' },
				{ title: 'Peak season breaks the plan', body: 'The staffing and door schedule that work in the off-season fall apart when the import peak hits.' },
			],
		},
		steps: {
			title: 'How a dock twin works',
			intro: 'A dashboard tells you what happened. A twin shows you what would happen.',
			items: [
				{ title: 'Mirror', body: 'We build a model of your facility from your own data: gate and yard logs, dock appointments, warehouse receipts and shipments, labor rosters and, where you have them, temperature sensors.' },
				{ title: 'Test', body: 'Your team tries changes on the twin first: appointment windows, forklift staffing by hour, put-away rules, door assignments or pre-cool capacity. Every scenario replays the same day, so comparisons are fair.' },
				{ title: 'Act', body: 'You get the changes worth making before the season, with the expected effect on truck turns, detention and time out of temperature, and a way to check the result after rollout.' },
			],
		},
		scenarios: {
			title: 'Questions you can answer before peak season',
			intro: 'Each one opens the demo twin with that change applied. The same trucks, the same day: only your change is different.',
			items: [
				{ question: 'What if trucks booked appointments instead of arriving in bridge waves?', href: '/cold-chain/demo/?a=appointments' },
				{ question: 'Should forklifts unload first, or put away first?', href: '/cold-chain/demo/?pr=balanced&at=1300' },
				{ question: 'How many drivers do we need for the afternoon wave?', href: '/cold-chain/demo/?f=8&at=1300' },
				{ question: 'What happens when two forklifts go down mid-morning?', href: '/cold-chain/demo/?fd=1&at=0845' },
				{ question: 'Can the dock survive a 40% peak-season surge?', href: '/cold-chain/demo/?su=1' },
				{ question: 'Is a bigger pre-cool tunnel worth it?', href: '/cold-chain/demo/?pc=72' },
			],
		},
		roi: {
			title: "What's a faster dock worth?",
			intro: 'Put in your own numbers for a rough annual estimate. The pilot replaces these assumptions with measured results.',
		},
		pilot: {
			title: 'A 30-day pilot',
			intro: 'One facility, one month, a fixed scope. You finish with a calibrated twin and a plan for your next peak.',
			items: [
				{ week: 'Week 1', title: 'Connect', body: 'We walk your dock with your supervisors, then collect a few weeks of gate logs, dock appointments, warehouse receipts and shipments, and labor schedules. Most WMS and yard systems can export these as standard reports.' },
				{ week: 'Week 2', title: 'Build and calibrate', body: 'We build the twin of your facility and check it against real days until truck turns, detention and dock dwell match what actually happened.' },
				{ week: 'Week 3', title: 'Test with your team', body: 'Working sessions with your operations manager and shift leads to try the changes you have been debating, plus a few you have not.' },
				{ week: 'Week 4', title: 'Readout', body: 'Recommended changes, expected impact on detention and product temperature, and a plan for the next peak. You keep the twin.' },
			],
		},
		faqs: {
			title: 'Common questions',
			items: [
				{ q: 'Do we need to install new software?', a: 'No. The pilot runs on data exports and a hosted twin your team can open in a browser. Nothing connects to your WMS or yard system unless you want it to later.' },
				{ q: 'What data do you need?', a: 'Gate or yard check-in and check-out times, dock appointments, receipts and shipments with timestamps, your door and room layout, and labor schedules. Temperature sensor data helps but is not required.' },
				{ q: 'Does it handle pre-cooling, inspections and multiple temperature zones?', a: 'Yes. The twin models each room and its capacity, pre-cooling time by commodity, loads held for inspection, and how long pallets sit on the dock before they reach temperature.' },
				{ q: 'Is this only for produce?', a: 'No. It works for any operation where trucks queue for doors and product moves through limited space and labor: cold storage, 3PL warehouses, cross-docks and distribution centers.' },
			],
		},
		closing: {
			title: "See your dock's day before it happens",
			body: "Tell us about your facility and the problem you'd most like to solve. We'll show you what a twin of it would look like.",
			demo: 'Try the demo first',
		},
	},
	es: {
		meta: {
			title: 'Gemelos digitales para cadena de frío | Lumen Analytica',
			description:
				'Gemelos digitales para almacenes frigoríficos, cross-docks de producto fresco y almacenes 3PL. Pruebe citas de andén, personal de montacargas y reglas de acomodo en un modelo vivo de su instalación antes de la temporada alta.',
		},
		eyebrow: 'Gemelos digitales para cadena de frío y operaciones 3PL',
		h1: 'Camiones más rápidos. Tarimas más frías. Menos cargos por demora.',
		lede: 'Construimos un modelo funcional de su andén, un gemelo digital, para que pueda probar citas, personal de montacargas y reglas de acomodo antes de que llegue la temporada, y saber qué efecto tendrán en la estancia de los camiones, los cargos por demora y la temperatura del producto.',
		ctaDemo: 'Pruebe el gemelo del cross-dock',
		ctaAssessment: 'Agende una evaluación del andén',
		problems: {
			title: '¿Le suena familiar?',
			intro: 'La mayoría de los problemas del andén no son de cuánta gente hay. Vienen de cuándo llegan los camiones y en qué trabaja primero la cuadrilla.',
			items: [
				{ title: 'El patio está lleno a las 10 a. m.', body: 'Los camiones salen del puente en olas, todos los andenes se llenan a la vez y empieza a correr el reloj de demora para los que siguen esperando.' },
				{ title: 'Las tarimas se calientan en el andén', body: 'Cuando la cuadrilla corre a vaciar remolques, el acomodo se atrasa y el producto pierde vida de anaquel grado por grado.' },
				{ title: 'El preenfriado y las inspecciones lo atoran todo', body: 'Un túnel lleno o una carga retenida bloquea las tarimas que vienen detrás, y el atraso se extiende por todo el andén.' },
				{ title: 'La temporada alta rompe el plan', body: 'El personal y las citas que funcionan en temporada baja se desmoronan cuando llega el pico de importación.' },
			],
		},
		steps: {
			title: 'Cómo funciona el gemelo de un andén',
			intro: 'Un tablero le dice lo que pasó. Un gemelo le muestra lo que pasaría.',
			items: [
				{ title: 'Reflejar', body: 'Construimos un modelo de su instalación con sus propios datos: registros de caseta y patio, citas de andén, recepciones y embarques, plantillas de personal y, si los tiene, sensores de temperatura.' },
				{ title: 'Probar', body: 'Su equipo prueba los cambios primero en el gemelo: ventanas de citas, montacarguistas por hora, reglas de acomodo, asignación de andenes o capacidad de preenfriado. Cada escenario repite el mismo día, así que las comparaciones son justas.' },
				{ title: 'Actuar', body: 'Usted recibe los cambios que vale la pena hacer antes de la temporada, con su efecto esperado en estancia de camiones, cargos por demora y tiempo fuera de temperatura, y una forma de medir el resultado después.' },
			],
		},
		scenarios: {
			title: 'Preguntas que puede responder antes de la temporada alta',
			intro: 'Cada una abre el gemelo de demostración con ese cambio aplicado. Los mismos camiones, el mismo día: solo cambia lo que usted cambió.',
			items: [
				{ question: '¿Y si los camiones llegaran con cita en lugar de en olas desde el puente?', href: '/cold-chain/demo/?a=appointments' },
				{ question: '¿Los montacargas deben descargar primero o acomodar primero?', href: '/cold-chain/demo/?pr=balanced&at=1300' },
				{ question: '¿Cuántos montacarguistas necesitamos para la ola de la tarde?', href: '/cold-chain/demo/?f=8&at=1300' },
				{ question: '¿Qué pasa si dos montacargas fallan a media mañana?', href: '/cold-chain/demo/?fd=1&at=0845' },
				{ question: '¿Aguanta el andén un aumento del 40% en temporada alta?', href: '/cold-chain/demo/?su=1' },
				{ question: '¿Vale la pena un túnel de preenfriado más grande?', href: '/cold-chain/demo/?pc=72' },
			],
		},
		roi: {
			title: '¿Cuánto vale un andén más rápido?',
			intro: 'Ingrese sus propios números para una estimación anual aproximada. El piloto reemplaza estos supuestos con resultados medidos.',
		},
		pilot: {
			title: 'Un piloto de 30 días',
			intro: 'Una instalación, un mes, un alcance fijo. Termina con un gemelo calibrado y un plan para su próxima temporada alta.',
			items: [
				{ week: 'Semana 1', title: 'Conectar', body: 'Recorremos su andén con sus supervisores y luego reunimos algunas semanas de registros de caseta, citas de andén, recepciones y embarques, y horarios de personal. La mayoría de los sistemas WMS y de patio pueden exportarlos como reportes estándar.' },
				{ week: 'Semana 2', title: 'Construir y calibrar', body: 'Construimos el gemelo de su instalación y lo comparamos con días reales hasta que la estancia de los camiones, los cargos por demora y el tiempo en el andén coincidan con lo que realmente pasó.' },
				{ week: 'Semana 3', title: 'Probar con su equipo', body: 'Sesiones de trabajo con su gerente de operaciones y sus jefes de turno para probar los cambios que han estado discutiendo, y algunos que no se les habían ocurrido.' },
				{ week: 'Semana 4', title: 'Resultados', body: 'Cambios recomendados, impacto esperado en cargos por demora y temperatura del producto, y un plan para la próxima temporada alta. El gemelo se queda con usted.' },
			],
		},
		faqs: {
			title: 'Preguntas frecuentes',
			items: [
				{ q: '¿Tenemos que instalar software nuevo?', a: 'No. El piloto funciona con datos exportados y un gemelo en línea que su equipo puede abrir en el navegador. No se conecta a su WMS ni a su sistema de patio, a menos que usted lo quiera más adelante.' },
				{ q: '¿Qué datos necesitan?', a: 'Horas de entrada y salida en caseta o patio, citas de andén, recepciones y embarques con hora, la distribución de sus andenes y cuartos, y horarios de personal. Los datos de sensores de temperatura ayudan, pero no son indispensables.' },
				{ q: '¿Contempla el preenfriado, las inspecciones y varias zonas de temperatura?', a: 'Sí. El gemelo modela cada cuarto y su capacidad, el tiempo de preenfriado por producto, las cargas retenidas para inspección y cuánto tiempo pasan las tarimas en el andén antes de llegar a temperatura.' },
				{ q: '¿Es solo para producto fresco?', a: 'No. Funciona para cualquier operación donde los camiones esperan andén y el producto se mueve con espacio y personal limitados: almacenes frigoríficos, almacenes 3PL, cross-docks y centros de distribución.' },
			],
		},
		closing: {
			title: 'Vea el día de su andén antes de que suceda',
			body: 'Cuéntenos sobre su instalación y el problema que más le gustaría resolver. Le mostraremos cómo se vería un gemelo de ella.',
			demo: 'Pruebe primero la demostración',
		},
	},
};
