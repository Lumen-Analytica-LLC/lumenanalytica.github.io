export type Lang = 'en' | 'es';

export const LANGS: Lang[] = ['en', 'es'];

/** Pages that exist in Spanish under /es/. Everything else falls back to English. */
const TRANSLATED = ['/', '/healthcare/', '/healthcare/demo/', '/cold-chain/', '/cold-chain/demo/', '/contact/', '/approach/', '/pilot/'];

/** Spanish pages live under /es/; English is unprefixed. */
export function langFromPath(pathname: string): Lang {
	return pathname === '/es' || pathname.startsWith('/es/') ? 'es' : 'en';
}

/** The language-neutral path, e.g. "/es/healthcare/" → "/healthcare/". */
export function basePath(pathname: string): string {
	const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
	return langFromPath(path) === 'es' ? path.slice(3) || '/' : path;
}

export function isTranslated(path: string): boolean {
	return TRANSLATED.includes(basePath(path.split(/[?#]/)[0]));
}

/** Link to `path` in `lang`, falling back to English for pages without a translation. */
export function localizePath(path: string, lang: Lang): string {
	const [pathname, suffix = ''] = path.split(/(?=[?#])/);
	const base = basePath(pathname);
	if (lang === 'es' && TRANSLATED.includes(base)) return `/es${base}${suffix}`;
	return `${base}${suffix}`;
}

/** The same page in the other language (or that language's home page if it isn't translated). */
export function alternateFor(pathname: string, lang: Lang): string {
	const base = basePath(pathname);
	return TRANSLATED.includes(base) ? localizePath(base, lang) : localizePath('/', lang);
}

/** Interface text shared across pages. */
export const UI = {
	en: {
		nav: { home: 'Home', healthcare: 'Healthcare', coldChain: 'Cold Chain', approach: 'Approach', about: 'About' },
		switchTo: 'Español',
		switchLabel: 'Ver esta página en español',
		cta: {
			title: 'Want a twin of your operation?',
			book: 'Book a 20-minute call',
			talk: 'Talk to us',
			message: 'Or send a message',
		},
		roi: {
			improvement: 'Improvement from changes tested in the twin',
			improvementHint: (subject: string) => `An assumption, not a promise. The pilot measures the real number for ${subject}.`,
			eyebrow: 'Estimated annual impact',
			send: 'Send these numbers with your inquiry →',
			fine: 'Estimates use only the numbers you enter. Nothing is sent until you submit the contact form.',
			yearly: 'a year',
			assumed: 'Assumed improvement',
		},
		preview: { open: 'Open the full twin →' },
		pilotDetails: 'Full pilot details',
	},
	es: {
		nav: { home: 'Inicio', healthcare: 'Salud', coldChain: 'Cadena de frío', approach: 'Enfoque', about: 'Nosotros' },
		switchTo: 'English',
		switchLabel: 'View this page in English',
		cta: {
			title: '¿Quiere un gemelo digital de su operación?',
			book: 'Agende una llamada de 20 minutos',
			talk: 'Hablemos',
			message: 'O envíenos un mensaje',
		},
		roi: {
			improvement: 'Mejora con los cambios probados en el gemelo',
			improvementHint: (subject: string) => `Es un supuesto, no una promesa. El piloto mide el número real para ${subject}.`,
			eyebrow: 'Impacto anual estimado',
			send: 'Enviar estos números con su consulta →',
			fine: 'El cálculo usa solo los números que usted ingresa. No se envía nada hasta que envíe el formulario de contacto.',
			yearly: 'al año',
			assumed: 'Mejora supuesta',
		},
		preview: { open: 'Abrir el gemelo completo →' },
		pilotDetails: 'Todos los detalles del piloto',
	},
} satisfies Record<Lang, unknown>;
