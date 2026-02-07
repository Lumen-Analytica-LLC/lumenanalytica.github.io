import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const collections = {
	services: defineCollection({
		// Load Markdown files in the src/content/services directory.
		loader: glob({ base: './src/content/services', pattern: '**/*.md' }),
		schema: z.object({
			title: z.string(),
			description: z.string(),
			publishDate: z.coerce.date(),
			tags: z.array(z.string()),
			img: z.string(),
			img_alt: z.string().optional(),
			order: z.number().optional(),
			category: z.enum(['Technical Services', 'Business Services', 'Governance & Compliance']).optional(),
		}),
	}),
};
