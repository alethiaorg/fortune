import axios from 'axios';
import { load } from 'cheerio';

import { OpenAPIHono, z } from '@hono/zod-openapi';

import { search as route } from '@/templates';
import { EntrySchema } from '@/schemas';

import { BASE_URL, USER_AGENT } from '../util/constants';
import { isPageGreaterThanLast } from '../helpers/parser';

type Entry = z.infer<typeof EntrySchema>;

const endpoint = new OpenAPIHono();

endpoint.openapi(route, async (c) => {
	let { query, page } = c.req.query();

	page = page && page !== 'null' ? page : '0';

	try {
		const _page = parseInt(page);
		const searchTerm = query.trim().replace(' ', '_');

		const { data: html } = await axios.get(`${BASE_URL}/search/story/${searchTerm}?page=${_page}`, {
			headers: { 'User-Agent': USER_AGENT }
		});

		const $ = load(html);

		if (isPageGreaterThanLast($, parseInt(page))) {
			return c.json([]);
		}

		const results: Array<Entry> = [];
		$('.search-story-item').each((_, element) => {
			const title = $(element).find('.item-title').text().trim();

			const cover = $(element).find('.img-loading').attr('src')!;

			const href = $(element).find('.bookmark_check').attr('href');
			const slug = href ? href.split('/').pop()! : '';

			results.push({
				slug,
				title,
				cover
			});
		});

		z.array(EntrySchema).parse(results);

		return c.json(results, 200);
	} catch (error: any) {
		if (axios.isAxiosError(error) && error.response?.status === 404) {
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
