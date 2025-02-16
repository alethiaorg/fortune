import axios from 'axios';
import { load } from 'cheerio';

import { OpenAPIHono, z } from '@hono/zod-openapi';

import { route } from '@/templates';
import { EntrySchema } from '@/schemas';

import { BASE_URL, USER_AGENT } from '../util/constants';
import { isPageGreaterThanLast } from '../helpers/parser';

type Entry = z.infer<typeof EntrySchema>;

const endpoint = new OpenAPIHono();

endpoint.openapi(route, async (c) => {
	let { page } = c.req.query();

	page = page && page !== 'null' ? page : '0';

	try {
		const _page = parseInt(page);

		const { data: html } = await axios.get(
			`${BASE_URL}/advanced_search?s=all&g_i=_43_&g_e=_44_&page=${_page}`,
			{
				headers: { 'User-Agent': USER_AGENT }
			}
		);

		const $ = load(html);

		if (isPageGreaterThanLast($, parseInt(page))) {
			return c.json([]);
		}

		const results: Array<Entry> = [];
		$('.content-genres-item').each((_, element) => {
			const title = $(element).find('.genres-item-name').text().trim();

			const cover = $(element).find('.genres-item-img img').attr('src')!;

			const href = $(element).find('.genres-item-img').attr('href');
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
