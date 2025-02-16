import axios from 'axios';
import { OpenAPIHono, z } from '@hono/zod-openapi';

import { ChapterSchema } from '@/schemas';
import { chapters as route } from '@/templates';

import { getChapters } from '../helpers/fetcher';

const endpoint = new OpenAPIHono();

endpoint.openapi(route, async (c) => {
	try {
		const { slug } = c.req.param();

		const results = await getChapters(slug);

		z.array(ChapterSchema).parse(results);

		return c.json(results);
	} catch (error: any) {
		if (axios.isAxiosError(error) && error.response?.status === 404) {
			return c.json({ code: 404, message: 'Manga not found' }, 404);
		}

		if (error instanceof z.ZodError) {
			return c.json({ code: 500, message: error.errors }, 500);
		}

		return c.json({ code: 500, message: error.message || 'Internal server error' }, 500);
	}
});

export default endpoint;
