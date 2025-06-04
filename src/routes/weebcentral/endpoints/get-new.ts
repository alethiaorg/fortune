import axios from 'axios';
import { load } from 'cheerio';

import { OpenAPIHono, z } from '@hono/zod-openapi';

import { route } from '@/templates';
import { EntrySchema } from '@/schemas';
import { encodeUri } from '@/util';

import { BASE_URL, USER_AGENT } from '../util/constants';

type Entry = z.infer<typeof EntrySchema>;

const endpoint = new OpenAPIHono();

endpoint.openapi(route, async (c) => {
	let { count, page } = c.req.query();

	count = count && count !== 'null' ? count : '32';
	page = page && page !== 'null' ? page : '1';

	try {
		const _count = parseInt(count);
		// Ensure page is at least 0
		// using offset-based counting hence -1
		const _page = Math.max(0, parseInt(page) - 1);

		const url = `${BASE_URL}/search/data?limit=${_count}&offset=${_count * _page
			}&sort=Recently+Added&order=Descending&official=Any&anime=Any&adult=Any&display_mode=Full+Display`;

		const { data: html } = await axios.get(url, {
			headers: { 'User-Agent': USER_AGENT }
		});

		const $ = load(html);

		const results: Array<Entry> = [];
		$('article.bg-base-300').each((i, el) => {
			const article = $(el);

			// Find the first <a> element whose href includes '/series/'
			const link = article.find("a[href*='/series/']").first();
			if (!link.length) {
				throw new Error("Link couldn't be find.");
			}

			// Get the href attribute
			const href = link.attr('href');

			if (!href) {
				throw new Error("Href couldn't be find.");
			}

			// Extract the slug without using regex:
			const parts = href.split('/series/');
			if (parts.length < 2) {
				throw new Error("Slug couldn't be find.");
			}
			const slugPart = parts[1].split('/')[0];
			const slug = `series/${slugPart}`;

			// Get the cover image by finding the first <img> inside the link
			const cover = link.find('img').first().attr('src') || '';

			// Get the title by selecting the <a> element with the class "link link-hover"
			const title = article.find('a.link.link-hover').first().text().trim();

			results.push({ slug: encodeUri(slug), cover, title });
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
