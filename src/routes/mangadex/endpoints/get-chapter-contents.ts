import axios from 'axios';
import { OpenAPIHono, z } from '@hono/zod-openapi';
import { chapterContents as route } from '@/templates';

import { BASE_URL, USER_AGENT } from '../util/constants';

const endpoint = new OpenAPIHono();

endpoint.openapi(route, async (c) => {
	try {
		const { slug } = c.req.param();
		const quality = c.req.query('quality') || 'data-saver';

		const response = await axios.get(`${BASE_URL}/at-home/server/${slug}`, {
			headers: { 'User-Agent': USER_AGENT }
		});

		const { baseUrl, chapter } = response.data;
		const { hash } = chapter;

		const filenames = quality === 'data' ? chapter.data : chapter.dataSaver;

		const urls = filenames.map((filename: string) => `${baseUrl}/${quality}/${hash}/${filename}`);

		// Validate that the result is an array of strings
		z.array(z.string()).parse(urls);

		return c.json(urls);
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
