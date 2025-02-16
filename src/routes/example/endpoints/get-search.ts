import { OpenAPIHono, z } from '@hono/zod-openapi';

import { search as route } from '@/templates';
import { EntrySchema } from '@/schemas';

type Entry = z.infer<typeof EntrySchema>;

const endpoint = new OpenAPIHono();

endpoint.openapi(route, async (c) => {
	let { query, count, page } = c.req.query();

	count = count && count !== 'null' ? count : '60';
	page = page && page !== 'null' ? page : '0';

	try {
		const _count = parseInt(count);
		const _page = parseInt(page);

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
