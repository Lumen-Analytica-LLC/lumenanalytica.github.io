import type { Lang } from '.';

interface Stage {
	title: string;
	summary: string;
	weDo: string[];
	youGet: string;
	service: { slug: string; label: string };
}

export interface ApproachContent {
	meta: { title: string; description: string };
	eyebrow: string;
	h1: string;
	lede: string;
	stagesTitle: string;
	stagesIntro: string;
	weDoLabel: string;
	youGetLabel: string;
	stages: Stage[];
	engagements: { title: string; intro: string; items: { name: string; body: string; cta?: { label: string; href: string } }[] };
	foundations: { title: string; intro: string; more: string; items: { slug: string; title: string; body: string }[] };
	closing: { title: string; body: string; pilot: string };
}

export const APPROACH: Record<Lang, ApproachContent> = {
	en: {
		meta: {
			title: 'Our Approach | Lumen Analytica',
			description:
				'How Lumen Analytica builds operational digital twins: assess, connect, model, optimize and operate, drawing on our data platform, operations research, software and governance services.',
		},
		eyebrow: 'Our approach',
		h1: 'From your floor to a working twin',
		lede: 'Every twin follows the same five stages. Each one draws on a service we already deliver, so you get one team from the first walk-through to keeping the model current.',
		stagesTitle: 'Five stages',
		stagesIntro: 'You see results at every stage, not only at the end.',
		weDoLabel: 'What we do',
		youGetLabel: 'What you get',
		stages: [
			{
				title: 'Assess',
				summary: 'Agree on the problem worth solving and the numbers that will prove it.',
				weDo: ['Walk the clinic floor or dock with the people who run it', 'Map the flow: arrivals, queues, rooms or doors, staff', 'Pick the two or three measures that matter most'],
				youGet: 'A one-page problem statement, a data request and a fixed-price proposal.',
				service: { slug: 'operations-research', label: 'Operations Research' },
			},
			{
				title: 'Connect',
				summary: 'Turn the exports you already have into a clean, trustworthy dataset.',
				weDo: ['Collect schedules, timestamps and layouts from your existing systems', 'Clean, join and check the data against what staff see day to day', 'Keep sensitive data minimal, de-identified and access-controlled'],
				youGet: 'A documented dataset you own, and a list of data gaps worth fixing.',
				service: { slug: 'data-platform', label: 'Data Platform' },
			},
			{
				title: 'Model',
				summary: 'Build the twin and prove it behaves like your operation.',
				weDo: ['Build the simulation of your rooms, doors, staff and rules', 'Replay real days until waits, turns and throughput match', 'Show your team the twin running their own day'],
				youGet: 'A calibrated twin your team can open in a browser.',
				service: { slug: 'operations-research', label: 'Operations Research' },
			},
			{
				title: 'Optimize',
				summary: 'Test the changes you are debating, and put a price on each one.',
				weDo: ['Run your scenarios side by side on the same simulated days', 'Search for schedule and staffing options you have not tried', 'Translate results into dollars: overtime, detention, lost visits, spoilage'],
				youGet: 'A short list of recommended changes with expected impact and cost.',
				service: { slug: 'accounting-operations', label: 'Accounting Operations' },
			},
			{
				title: 'Operate',
				summary: 'Keep the twin current so it stays useful after the project.',
				weDo: ['Refresh the data and recalibrate on a regular schedule', 'Re-plan ahead of each season, surge or staffing change', 'Measure what actually changed after rollout'],
				youGet: 'A living model and a standing way to test the next decision.',
				service: { slug: 'software-development', label: 'Software Development' },
			},
		],
		engagements: {
			title: 'Ways to work with us',
			intro: 'Start small, prove the value, then decide how far to go.',
			items: [
				{ name: 'Assessment', body: 'A fixed-price look at one problem in one location: the walk-through, the data request and a clear recommendation on whether a twin is worth building.' },
				{ name: '30-day pilot', body: 'One site, one month, a fixed scope. You finish with a calibrated twin and a short list of changes worth making.', cta: { label: 'See the pilot', href: '/pilot/' } },
				{ name: 'Operate', body: 'An ongoing arrangement to keep the twin current: regular recalibration, scenario reviews and re-planning before each peak.' },
			],
		},
		foundations: {
			title: "What's underneath every twin",
			intro: 'The services we have offered for years are the building blocks of each twin.',
			more: 'Learn more',
			items: [
				{ slug: 'data-platform', title: 'Data Platform', body: 'Pipelines and warehouses that turn scattered exports into one reliable dataset.' },
				{ slug: 'operations-research', title: 'Operations Research', body: 'Simulation, queueing and optimization: the math inside the twin.' },
				{ slug: 'software-development', title: 'Software Development', body: 'The browser-based twin, dashboards and integrations your team uses.' },
				{ slug: 'governance', title: 'Governance, Risk & Compliance', body: 'Access controls, documentation and privacy practices for sensitive data.' },
				{ slug: 'accounting-operations', title: 'Accounting Operations', body: 'Costing and ROI, so every recommendation comes with a price tag.' },
			],
		},
		closing: {
			title: 'Start with a conversation',
			body: "Tell us about the operation and the problem. We'll tell you honestly whether a twin is the right tool.",
			pilot: 'See the 30-day pilot',
		},
	},
	es: {
		meta: {
			title: 'Nuestro enfoque | Lumen Analytica',
			description:
				'Cómo construye Lumen Analytica gemelos digitales operativos: evaluar, conectar, modelar, optimizar y operar, con base en nuestros servicios de plataforma de datos, investigación de operaciones, software y gobierno de datos.',
		},
		eyebrow: 'Nuestro enfoque',
		h1: 'De su piso a un gemelo que funciona',
		lede: 'Cada gemelo sigue las mismas cinco etapas. Cada una se apoya en un servicio que ya ofrecemos, así que trabaja con un solo equipo desde el primer recorrido hasta mantener el modelo al día.',
		stagesTitle: 'Cinco etapas',
		stagesIntro: 'Ve resultados en cada etapa, no solo al final.',
		weDoLabel: 'Lo que hacemos',
		youGetLabel: 'Lo que recibe',
		stages: [
			{
				title: 'Evaluar',
				summary: 'Acordar el problema que vale la pena resolver y los números que lo demostrarán.',
				weDo: ['Recorrer la clínica o el andén con la gente que lo opera', 'Mapear el flujo: llegadas, filas, consultorios o andenes, personal', 'Elegir las dos o tres medidas que más importan'],
				youGet: 'Una definición del problema en una página, una solicitud de datos y una propuesta de precio fijo.',
				service: { slug: 'operations-research', label: 'Investigación de operaciones' },
			},
			{
				title: 'Conectar',
				summary: 'Convertir los datos que ya exporta en un conjunto limpio y confiable.',
				weDo: ['Reunir agendas, horarios y distribuciones de sus sistemas actuales', 'Limpiar, unir y validar los datos contra lo que el personal ve a diario', 'Mantener los datos sensibles al mínimo, anonimizados y con acceso controlado'],
				youGet: 'Un conjunto de datos documentado que es suyo, y una lista de huecos de datos que vale la pena corregir.',
				service: { slug: 'data-platform', label: 'Plataforma de datos' },
			},
			{
				title: 'Modelar',
				summary: 'Construir el gemelo y demostrar que se comporta como su operación.',
				weDo: ['Construir la simulación de sus consultorios, andenes, personal y reglas', 'Repetir días reales hasta que coincidan esperas, estancias y volumen', 'Mostrarle a su equipo el gemelo corriendo su propio día'],
				youGet: 'Un gemelo calibrado que su equipo puede abrir en el navegador.',
				service: { slug: 'operations-research', label: 'Investigación de operaciones' },
			},
			{
				title: 'Optimizar',
				summary: 'Probar los cambios que están discutiendo y ponerle precio a cada uno.',
				weDo: ['Correr sus escenarios lado a lado sobre los mismos días simulados', 'Buscar opciones de agenda y personal que no han probado', 'Traducir los resultados a dinero: horas extra, demoras, consultas perdidas, merma'],
				youGet: 'Una lista corta de cambios recomendados con su impacto y costo esperados.',
				service: { slug: 'accounting-operations', label: 'Contabilidad y operaciones' },
			},
			{
				title: 'Operar',
				summary: 'Mantener el gemelo al día para que siga siendo útil después del proyecto.',
				weDo: ['Actualizar los datos y recalibrar de forma periódica', 'Replanear antes de cada temporada, aumento de demanda o cambio de personal', 'Medir qué cambió realmente después de implementar'],
				youGet: 'Un modelo vivo y una forma permanente de probar la siguiente decisión.',
				service: { slug: 'software-development', label: 'Desarrollo de software' },
			},
		],
		engagements: {
			title: 'Formas de trabajar con nosotros',
			intro: 'Empiece en pequeño, compruebe el valor y luego decida hasta dónde llegar.',
			items: [
				{ name: 'Evaluación', body: 'Una revisión de precio fijo de un problema en una ubicación: el recorrido, la solicitud de datos y una recomendación clara sobre si vale la pena construir un gemelo.' },
				{ name: 'Piloto de 30 días', body: 'Una ubicación, un mes, un alcance fijo. Termina con un gemelo calibrado y una lista corta de cambios que vale la pena hacer.', cta: { label: 'Ver el piloto', href: '/pilot/' } },
				{ name: 'Operación continua', body: 'Un acuerdo continuo para mantener el gemelo al día: recalibración periódica, revisiones de escenarios y replaneación antes de cada temporada alta.' },
			],
		},
		foundations: {
			title: 'Lo que hay debajo de cada gemelo',
			intro: 'Los servicios que ofrecemos desde hace años son los bloques con los que construimos cada gemelo.',
			more: 'Más información (en inglés)',
			items: [
				{ slug: 'data-platform', title: 'Plataforma de datos', body: 'Flujos y almacenes de datos que convierten exportaciones dispersas en un conjunto confiable.' },
				{ slug: 'operations-research', title: 'Investigación de operaciones', body: 'Simulación, teoría de colas y optimización: las matemáticas dentro del gemelo.' },
				{ slug: 'software-development', title: 'Desarrollo de software', body: 'El gemelo en el navegador, los tableros y las integraciones que usa su equipo.' },
				{ slug: 'governance', title: 'Gobierno y cumplimiento', body: 'Controles de acceso, documentación y prácticas de privacidad para datos sensibles.' },
				{ slug: 'accounting-operations', title: 'Contabilidad y operaciones', body: 'Costeo y retorno de inversión, para que cada recomendación venga con su precio.' },
			],
		},
		closing: {
			title: 'Empiece con una conversación',
			body: 'Cuéntenos sobre la operación y el problema. Le diremos con honestidad si un gemelo es la herramienta correcta.',
			pilot: 'Vea el piloto de 30 días',
		},
	},
};
