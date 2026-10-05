/**
 * Where inquiries go. Fill these in once the accounts exist:
 *
 * - `formspreeId`: the ID from your Formspree form's endpoint, https://formspree.io/f/<ID>.
 *   Until it is set, the contact form falls back to opening an email with the same details.
 * - `bookingUrl`: a public scheduling page (Cal.com, Calendly, Google Calendar booking page…).
 *   Until it is set, "Book a call" buttons point to the contact form instead.
 */
export const CONTACT = {
	email: 'insights@lumenanalytica.io',
	formspreeId: 'mkjowlwz',
	bookingUrl: 'https://cal.com/lumenanalytica/consultation',
};

export const FORM_ENDPOINT = CONTACT.formspreeId ? `https://formspree.io/f/${CONTACT.formspreeId}` : '';

export type Industry = 'healthcare' | 'cold-chain' | 'education' | 'other';

export const INDUSTRIES: Record<Industry, string> = {
	healthcare: 'Healthcare (clinic, hospital, urgent care)',
	'cold-chain': 'Cold storage, 3PL or cross-dock',
	education: 'Education',
	other: 'Something else',
};

/** Link to the contact page, pre-selecting an industry and noting where the visitor came from. */
export function contactHref(industry?: Industry, from?: string): string {
	const params = new URLSearchParams();
	if (industry) params.set('industry', industry);
	if (from) params.set('from', from);
	const query = params.toString();
	return `/contact/${query ? `?${query}` : ''}`;
}

/** Booking page if configured, otherwise the contact form. */
export function bookingHref(industry?: Industry, from?: string): string {
	return CONTACT.bookingUrl || contactHref(industry, from);
}

/** sessionStorage key for details carried from an ROI calculator or demo to the contact form. */
export const HANDOFF_KEY = 'lumen-contact-handoff';

export interface ContactHandoff {
	industry?: Industry;
	/** Human-readable summary, e.g. the ROI inputs and estimate. */
	summary?: string;
	/** A demo scenario link the visitor was looking at. */
	scenario?: string;
}
