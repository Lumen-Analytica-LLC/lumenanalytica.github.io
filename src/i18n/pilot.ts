import type { Lang } from '.';

export interface PilotContent {
	meta: { title: string; description: string };
	eyebrow: string;
	h1: string;
	lede: string;
	cta: string;
	fit: { title: string; intro: string; items: string[] };
	weeks: { title: string; intro: string; items: { week: string; title: string; body: string }[] };
	deliverables: { title: string; items: { title: string; body: string }[] };
	needs: { title: string; items: string[] };
	after: { title: string; body: string; items: string[] };
	pricing: { title: string; body: string };
	faqs: { title: string; items: { q: string; a: string }[] };
	closing: { title: string; body: string; examples: string; clinic: string; cold: string };
}

export const PILOT: Record<Lang, PilotContent> = {
	en: {
		meta: {
			title: '30-Day Digital Twin Pilot | Lumen Analytica',
			description:
				'A fixed-scope, 30-day pilot: one site, one problem, a calibrated digital twin and a short list of changes worth making, for clinics, cold storage and 3PL operations.',
		},
		eyebrow: '30-day pilot',
		h1: 'One site. One month. A twin you can use.',
		lede: 'The pilot is the fastest way to find out what a digital twin can do for your operation. It has a fixed scope, a fixed price and a clear finish line.',
		cta: 'Talk to us about a pilot',
		fit: {
			title: 'A good fit if…',
			intro: 'The pilot works best when the problem is specific and the cost of getting it wrong is real.',
			items: [
				'You have one location where waits, queues or overtime keep coming up',
				'You are debating a change: a new schedule, staffing plan, door policy or layout',
				'You can export schedules and timestamps from the systems you already use',
				'Someone on your team can own the pilot and join three working sessions',
			],
		},
		weeks: {
			title: 'How the 30 days run',
			intro: 'The same four weeks whether it is a clinic or a dock.',
			items: [
				{ week: 'Week 1', title: 'Connect', body: 'Kickoff and walk-through, agree on the measures, and collect a few weeks of schedule and timestamp exports.' },
				{ week: 'Week 2', title: 'Build and calibrate', body: 'Build the twin and replay real days until it matches what actually happened. You review it with us.' },
				{ week: 'Week 3', title: 'Test with your team', body: 'Working sessions to try the changes you have been debating, plus a few you have not.' },
				{ week: 'Week 4', title: 'Readout', body: 'Recommendations, expected impact in dollars and minutes, and a plan to measure the result after rollout.' },
			],
		},
		deliverables: {
			title: 'What you keep',
			items: [
				{ title: 'A calibrated twin', body: 'Your operation, running in a browser, with the scenarios we tested saved and shareable.' },
				{ title: 'A scenario report', body: 'Each option you tested, side by side on the same days, with its effect on the measures you chose.' },
				{ title: 'An ROI readout', body: 'The expected impact in dollars, built from your own costs, not industry averages.' },
				{ title: 'A measurement plan', body: 'How to tell, after rollout, whether the change delivered what the twin predicted.' },
				{ title: 'Your clean dataset', body: 'The documented data we assembled, ready for your own reporting.' },
			],
		},
		needs: {
			title: 'What we need from you',
			items: [
				'A pilot owner who knows the operation day to day',
				'Exports of schedules and timestamps for a few representative weeks',
				'Your room or door layout and staffing pattern',
				'About an hour each for three working sessions',
			],
		},
		after: {
			title: 'After the pilot',
			body: 'Many teams keep the twin running. Some stop at the pilot. Either is fine: you own what we built.',
			items: [
				'Regular data refresh and recalibration',
				'Quarterly scenario reviews with your leadership team',
				'Re-planning ahead of each season, surge or staffing change',
				'Extending the twin to another site or department',
			],
		},
		pricing: {
			title: 'Pricing',
			body: 'Fixed price, agreed before we start, based on the size of the site and the data involved. No hourly billing and no surprise change orders.',
		},
		faqs: {
			title: 'Common questions',
			items: [
				{ q: 'What if the twin does not match reality?', a: 'Calibration is part of the pilot. We replay real days and adjust until waits, turns and throughput line up, and we show you how close it got before we test any changes.' },
				{ q: 'How do you handle sensitive data?', a: 'We ask for the minimum needed, prefer de-identified extracts, and keep access limited to the people working on your pilot.' },
				{ q: 'Do we need to change any systems?', a: 'No. The pilot runs on exports from systems you already use. Nothing connects to them unless you want it to later.' },
				{ q: 'Can we start smaller?', a: 'Yes. A short assessment covers the walk-through and data review, and tells you whether a full pilot is worth it.' },
			],
		},
		closing: {
			title: 'Ready to see your operation run?',
			body: 'Book a short call. We will talk through the problem and whether a pilot is the right next step.',
			examples: 'See what a twin looks like first:',
			clinic: 'Clinic twin',
			cold: 'Cross-dock twin',
		},
	},
	es: {
		meta: {
			title: 'Piloto de gemelo digital de 30 días | Lumen Analytica',
			description:
				'Un piloto de 30 días con alcance fijo: una ubicación, un problema, un gemelo digital calibrado y una lista corta de cambios que vale la pena hacer, para clínicas, almacenes frigoríficos y operaciones 3PL.',
		},
		eyebrow: 'Piloto de 30 días',
		h1: 'Una ubicación. Un mes. Un gemelo que puede usar.',
		lede: 'El piloto es la forma más rápida de saber qué puede hacer un gemelo digital por su operación. Tiene un alcance fijo, un precio fijo y una meta clara.',
		cta: 'Hablemos de un piloto',
		fit: {
			title: 'Es buena opción si…',
			intro: 'El piloto funciona mejor cuando el problema es concreto y equivocarse cuesta dinero.',
			items: [
				'Tiene una ubicación donde las esperas, las filas o las horas extra son un tema constante',
				'Están discutiendo un cambio: nueva agenda, plan de personal, regla de andenes o distribución',
				'Puede exportar agendas y horarios de los sistemas que ya usa',
				'Alguien de su equipo puede encargarse del piloto y asistir a tres sesiones de trabajo',
			],
		},
		weeks: {
			title: 'Cómo transcurren los 30 días',
			intro: 'Las mismas cuatro semanas, sea una clínica o un andén.',
			items: [
				{ week: 'Semana 1', title: 'Conectar', body: 'Arranque y recorrido, acordar las medidas y reunir algunas semanas de agendas y horarios exportados.' },
				{ week: 'Semana 2', title: 'Construir y calibrar', body: 'Construimos el gemelo y repetimos días reales hasta que coincida con lo que realmente pasó. Usted lo revisa con nosotros.' },
				{ week: 'Semana 3', title: 'Probar con su equipo', body: 'Sesiones de trabajo para probar los cambios que han estado discutiendo, y algunos que no se les habían ocurrido.' },
				{ week: 'Semana 4', title: 'Resultados', body: 'Recomendaciones, impacto esperado en dinero y minutos, y un plan para medir el resultado después de implementar.' },
			],
		},
		deliverables: {
			title: 'Lo que se queda con usted',
			items: [
				{ title: 'Un gemelo calibrado', body: 'Su operación, funcionando en el navegador, con los escenarios que probamos guardados y listos para compartir.' },
				{ title: 'Un reporte de escenarios', body: 'Cada opción que probamos, lado a lado sobre los mismos días, con su efecto en las medidas que eligió.' },
				{ title: 'Un análisis de retorno', body: 'El impacto esperado en dinero, calculado con sus propios costos, no con promedios de la industria.' },
				{ title: 'Un plan de medición', body: 'Cómo saber, después de implementar, si el cambio dio lo que el gemelo predijo.' },
				{ title: 'Sus datos limpios', body: 'El conjunto de datos documentado que armamos, listo para sus propios reportes.' },
			],
		},
		needs: {
			title: 'Lo que necesitamos de usted',
			items: [
				'Un responsable del piloto que conozca la operación del día a día',
				'Agendas y horarios exportados de algunas semanas representativas',
				'La distribución de sus consultorios o andenes y su patrón de personal',
				'Alrededor de una hora para cada una de tres sesiones de trabajo',
			],
		},
		after: {
			title: 'Después del piloto',
			body: 'Muchos equipos mantienen el gemelo funcionando. Otros se quedan con el piloto. Cualquiera de las dos está bien: lo que construimos es suyo.',
			items: [
				'Actualización periódica de datos y recalibración',
				'Revisiones trimestrales de escenarios con su equipo directivo',
				'Replaneación antes de cada temporada, aumento de demanda o cambio de personal',
				'Extender el gemelo a otra ubicación o departamento',
			],
		},
		pricing: {
			title: 'Precio',
			body: 'Precio fijo, acordado antes de empezar, según el tamaño de la ubicación y los datos involucrados. Sin cobro por hora y sin cambios de alcance sorpresa.',
		},
		faqs: {
			title: 'Preguntas frecuentes',
			items: [
				{ q: '¿Y si el gemelo no coincide con la realidad?', a: 'La calibración es parte del piloto. Repetimos días reales y ajustamos hasta que coincidan esperas, estancias y volumen, y le mostramos qué tan cerca quedó antes de probar cualquier cambio.' },
				{ q: '¿Cómo manejan los datos sensibles?', a: 'Pedimos lo mínimo necesario, preferimos extractos anonimizados y limitamos el acceso a las personas que trabajan en su piloto.' },
				{ q: '¿Tenemos que cambiar algún sistema?', a: 'No. El piloto funciona con datos exportados de los sistemas que ya usa. No se conecta a ellos a menos que usted lo quiera más adelante.' },
				{ q: '¿Podemos empezar con algo más pequeño?', a: 'Sí. Una evaluación breve cubre el recorrido y la revisión de datos, y le dice si vale la pena un piloto completo.' },
			],
		},
		closing: {
			title: '¿Listo para ver su operación en marcha?',
			body: 'Agende una llamada breve. Platicaremos sobre el problema y si un piloto es el siguiente paso correcto.',
			examples: 'Vea primero cómo se ve un gemelo:',
			clinic: 'Gemelo de la clínica',
			cold: 'Gemelo del cross-dock',
		},
	},
};
