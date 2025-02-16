import { OpenAPIHono, z } from '@hono/zod-openapi';

import { detail as route } from '@/templates';
import { ChapterSchema, DetailSchema, MangaSchema, OriginSchema } from '@/schemas';

type Manga = z.infer<typeof MangaSchema>;
type Origin = z.infer<typeof OriginSchema>;
type Chapter = z.infer<typeof ChapterSchema>;
type Detail = z.infer<typeof DetailSchema>;

const endpoint = new OpenAPIHono();

endpoint.openapi(route, async (c) => {
	try {
		// Use slug from request params to fetch manga details (if needed)
		// const { slug } = c.req.param();

		const manga: Manga = {
			title: 'Bakemonogatari',
			authors: ['Nisio Isin'],
			synopsis:
				'Koyomi Araragi, a third-year high school student, manages to survive a vampire attack with the help of Meme...',
			alternativeTitles: ['Ghostory'],
			tags: ['Comedy', 'Drama', 'Mystery', 'Romance', 'Supernatural']
		};

		const origin: Origin = {
			slug: 'manga-123456',
			url: 'https://example.com/manga/manga-123456',
			referer: 'https://example.com',
			covers: ['https://example.com/manga/manga-123456/cover.jpg'],
			status: 'Unknown',
			classification: 'Unknown',
			creation: new Date('2010-11-01T00:00:00Z')
		};

		const chapters: Array<Chapter> = [
			{
				title: 'Chapter 1',
				slug: 'chapter-1',
				number: 1,
				date: new Date('2010-11-01T00:00:00Z'),
				scanlator: 'example-scanlator'
			},
			{
				title: 'Chapter 2',
				slug: 'chapter-2',
				number: 2,
				date: new Date('2010-11-01T00:00:00Z'),
				scanlator: 'example-scanlator'
			},
			{
				title: 'Chapter 3',
				slug: 'chapter-3',
				number: 3,
				date: new Date('2010-11-01T00:00:00Z'),
				scanlator: 'example-scanlator'
			}
		];

		const result: Detail = {
			manga,
			origin,
			chapters
		};

		// validate
		DetailSchema.parse(result);

		return c.json(result, 200);
	} catch (error: any) {
		// Handle Network Errors
		if (false) {
			return c.json({ code: 404, message: 'Network error' }, 404);
		}

		// Handle Zod validation errors
		if (error instanceof z.ZodError) {
			return c.json({ code: 500, message: error.errors }, 500);
		}

		// Generic error handling
		return c.json({ code: 500, message: error.message || 'Internal server error' }, 500);
	}
});

export default endpoint;
