import type { Lang } from '.';

export const CONTACT_PAGE = {
	en: {
		meta: {
			title: 'Contact | Lumen Analytica',
			description:
				"Tell us about your clinic, dock or warehouse and the problem you'd most like to solve. We'll show you what a digital twin of it would look like.",
		},
		title: "Let's look at your operation",
		tagline:
			"Tell us about your clinic, dock or warehouse and the problem you'd most like to solve. We'll follow up to set up a short call.",
		fields: {
			name: 'Name',
			email: 'Work email',
			organization: 'Organization',
			role: 'Role',
			optional: '(optional)',
			industry: 'Industry',
			location: 'Location',
			interest: 'What are you interested in?',
			message: "What's the problem you'd most like to solve?",
			placeholder: 'e.g. Our waiting room is full by 10 a.m. / Trucks wait hours for a door during the morning wave.',
		},
		locations: ['Rio Grande Valley', 'San Antonio', 'Austin', 'Elsewhere in Texas', 'Outside Texas'],
		interests: { assessment: 'A twin assessment for our operation', pilot: 'A 30-day pilot', exploring: 'Just exploring' },
		attached: 'Included with your message',
		remove: 'Remove',
		scenario: 'Demo scenario',
		subject: 'New inquiry from lumenanalytica.io',
		send: 'Send message',
		sending: 'Sending…',
		error: (email: string) => `Something went wrong sending your message. Please try again, or email ${email}.`,
		thanks: {
			title: "Thanks, we've got it.",
			body: "We'll reply by email to set up a short call. In the meantime, try the live twins:",
			clinic: 'Clinic twin',
			cold: 'Cross-dock twin',
		},
		book: { title: 'Rather talk now?', body: 'Pick a time for a 20-minute call.', cta: 'Book a call' },
		next: {
			title: 'What happens next',
			steps: [
				'We reply to set up a short call about your operation.',
				'We talk through the problem and the data you already have.',
				'If a twin is a good fit, we propose a fixed-scope assessment or pilot.',
			],
		},
		orEmail: 'Or email us at',
	},
	es: {
		meta: {
			title: 'Contacto | Lumen Analytica',
			description:
				'Cuéntenos sobre su clínica, andén o almacén y el problema que más le gustaría resolver. Le mostraremos cómo se vería un gemelo digital de su operación.',
		},
		title: 'Revisemos su operación',
		tagline:
			'Cuéntenos sobre su clínica, andén o almacén y el problema que más le gustaría resolver. Le escribiremos para agendar una llamada breve.',
		fields: {
			name: 'Nombre',
			email: 'Correo de trabajo',
			organization: 'Organización',
			role: 'Puesto',
			optional: '(opcional)',
			industry: 'Sector',
			location: 'Ubicación',
			interest: '¿Qué le interesa?',
			message: '¿Cuál es el problema que más le gustaría resolver?',
			placeholder: 'p. ej. Nuestra sala de espera está llena a las 10 a. m. / Los camiones esperan horas por un andén durante la ola de la mañana.',
		},
		locations: ['Valle del Río Grande', 'San Antonio', 'Austin', 'Otra parte de Texas', 'Fuera de Texas'],
		interests: { assessment: 'Una evaluación para nuestra operación', pilot: 'Un piloto de 30 días', exploring: 'Solo estoy explorando' },
		attached: 'Se incluye con su mensaje',
		remove: 'Quitar',
		scenario: 'Escenario de la demostración',
		subject: 'Nueva consulta desde lumenanalytica.io (español)',
		send: 'Enviar mensaje',
		sending: 'Enviando…',
		error: (email: string) => `Hubo un problema al enviar su mensaje. Intente de nuevo o escríbanos a ${email}.`,
		thanks: {
			title: 'Gracias, recibimos su mensaje.',
			body: 'Le responderemos por correo para agendar una llamada breve. Mientras tanto, pruebe los gemelos en vivo:',
			clinic: 'Gemelo de la clínica',
			cold: 'Gemelo del cross-dock',
		},
		book: { title: '¿Prefiere hablar ahora?', body: 'Elija un horario para una llamada de 20 minutos.', cta: 'Agendar una llamada' },
		next: {
			title: 'Qué sigue',
			steps: [
				'Le escribimos para agendar una llamada breve sobre su operación.',
				'Platicamos sobre el problema y los datos que ya tiene.',
				'Si un gemelo es buena opción, le proponemos una evaluación o un piloto de alcance fijo.',
			],
		},
		orEmail: 'O escríbanos a',
	},
} satisfies Record<Lang, unknown>;
