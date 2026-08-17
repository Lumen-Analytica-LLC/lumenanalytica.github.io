import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const collections = {
	services: defineCollection({
		// Load Markdown files in the src/content/services directory.
		loader: glob({ base: './src/content/services', pattern: '**/*.{md,mdx}' }),
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
	'case-studies': defineCollection({
		// Load Markdown files in the src/content/case-studies directory.
		loader: glob({ base: './src/content/case-studies', pattern: '**/*.{md,mdx}' }),
		schema: z.object({
			title: z.string(),
			description: z.string(),
			publishDate: z.coerce.date(),
			tags: z.array(z.string()),
			outcomes: z
				.array(
					z.object({
						label: z.string(),
						value: z.string(),
					})
				)
				.optional(),
			img: z.string(),
			img_alt: z.string().optional(),
		}),
	}),
};
