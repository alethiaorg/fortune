import { OpenAPIHono, z } from '@hono/zod-openapi';

import { chapters as route } from '@/templates';
import { ChapterSchema } from '@/schemas';

type Chapter = z.infer<typeof ChapterSchema>;

const endpoint = new OpenAPIHono();

endpoint.openapi(route, async (c) => {
	try {
		// Use slug from request params to fetch manga details
		// const { slug } = c.req.param();

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

		// validate
		z.array(ChapterSchema).parse(chapters);

		return c.json<Array<Chapter>>(chapters, 200);
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
