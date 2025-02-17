import axios from 'axios';
import { load } from 'cheerio';

import { OpenAPIHono, z } from '@hono/zod-openapi';

import { chapterContents as route } from '@/templates';

import { BASE_URL, USER_AGENT } from '../util/constants';

const endpoint = new OpenAPIHono();

endpoint.openapi(route, async (c) => {
	try {
		const { slug } = c.req.param();

		const url = `${BASE_URL}/${slug}/images?is_prev=False&current_page=1&reading_style=long_strip`;

		const { data: html } = await axios.get(url, {
			headers: {
				'User-Agent': USER_AGENT
			}
		});

		const $ = load(html);
		const contents: Array<string> = [];

		$('section.flex-1.flex.flex-col.pb-4.cursor-pointer img').each((_, element) => {
			const imageUrl = $(element).attr('src');

			if (imageUrl) {
				contents.push(imageUrl);
			}
		});

		z.array(z.string()).parse(contents);

		return c.json(contents, 200);
	} catch (error: any) {
		// Handle Network Errors
		if (axios.isAxiosError(error) && error.response?.status === 404) {
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
