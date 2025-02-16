import { OpenAPIHono, z } from '@hono/zod-openapi';
import { chapterContents as route } from '@/templates';

const endpoint = new OpenAPIHono();

endpoint.openapi(route, async (c) => {
	try {
		// Use slug from request params to fetch manga details
		// const { slug } = c.req.param();

		// Should be an array of image URLs
		const contents: Array<string> = [
			'https://example.com/image1.jpg',
			'https://example.com/image2.jpg',
			'https://example.com/image3.jpg'
		];

		// validate
		z.array(z.string()).parse(contents);

		return c.json<Array<string>>(contents, 200);
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
