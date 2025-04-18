import { OpenAPIHono, z } from '@hono/zod-openapi';

import { route } from '@/templates';
import { EntrySchema } from '@/schemas';

type Entry = z.infer<typeof EntrySchema>;

const endpoint = new OpenAPIHono();

endpoint.openapi(route, async (c) => {
	// Fetching based on current page
	const { count = '60', page = '0' } = c.req.query();

	try {
		// values from query are always strings so need to parse as ints
		const _count = parseInt(count);
		const _page = parseInt(page);

		// return early
		if (page > 0) {
			return c.json([], 200)
		}
		
		const total: Array<Entry> = [
			{
				slug: 'manga-123456',
				title: 'Manga 123456',
				cover: 'https://www.example.com/manga-123456/cover.jpg'
			},
			{
				slug: 'manga-98765',
				title: 'Manga 98765',
				cover: 'https://www.example.com/manga-98765/cover.jpg'
			},
			{
				slug: 'manga-69420',
				title: 'Manga 69420',
				cover: 'https://www.example.com/manga-69420/cover.jpg'
			}
		];

		z.array(EntrySchema).parse(total);

		return c.json(total, 200);
	} catch (error: any) {
		if (false) {
			return c.json({ code: 404, message: 'Manga not found' }, 404);
		}

		// Log the complete error for debugging
		console.error('Error occurred:', error);

		// If the error is from Zod validation, you can return the error details
		if (error instanceof z.ZodError) {
			return c.json({ code: 500, message: error.errors }, 500);
		}

		// Otherwise, return a generic message with the error message if available
		return c.json({ code: 500, message: error.message || 'Internal server error' }, 500);
	}
});

export default endpoint;
