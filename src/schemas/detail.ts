import { z } from '@hono/zod-openapi';

import { ChapterSchema } from './chapter';
import { MangaSchema } from './manga';
import { OriginSchema } from './origin';

export const DetailSchema = z
	.object({
		manga: MangaSchema.openapi({
			description: 'Manga details',
			example: {
				title: 'Bakemonogatari',
				authors: ['Nisio Isin'],
				synopsis:
					'Koyomi Araragi, a third-year high school student, manages to survive a vampire attack with the help of ...',
				alternativeTitles: ['Monogatari Series', 'Ghostory'],
				tags: ['Vampires', 'Supernatural', 'Comedy']
			}
		}),
		origin: OriginSchema.openapi({
			description: 'Origin details',
			example: {
				slug: 'manga-123456',
				url: 'https://example.com/manga/manga-123456',
				referer: 'https://example.com',
				rating: 4.5,
				covers: ['https://example.com/manga/manga-123456/cover.jpg'],
				status: 'Ongoing',
				classification: 'Safe',
				creation: new Date('2021-01-01T00:00:00.000Z')
			}
		}),
		chapters: z.array(ChapterSchema).openapi({
			description: 'Chapter details',
			example: [
				{
					title: 'Hitagi Crab',
					slug: 'chapter-123456',
					number: 1,
					scanlator: '/a/nonymous',
					date: new Date('2021-01-01T00:00:00.000Z')
				}
			]
		})
	})
	.openapi('Detail');
