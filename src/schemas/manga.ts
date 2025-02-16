import { z } from '@hono/zod-openapi';

export const MangaSchema = z
	.object({
		title: z.string().openapi({
			description: 'The title of the manga',
			example: 'Bakemonogatari'
		}),

		authors: z.array(z.string()).openapi({
			description: 'The author(s) of the manga',
			example: ['Nisio Isin']
		}),

		synopsis: z.string().openapi({
			description: 'The synopsis of the manga',
			example:
				'Koyomi Araragi, a third-year high school student, manages to survive a vampire attack with the help of ...'
		}),

		alternativeTitles: z.array(z.string()).openapi({
			description: 'Alternative titles of the manga',
			example: ['Monogatari Series', 'Ghostory']
		}),

		tags: z.array(z.string()).openapi({
			description: 'Tags associated with the manga',
			example: ['Vampires', 'Supernatural', 'Comedy']
		})
	})
	.openapi('Manga');
