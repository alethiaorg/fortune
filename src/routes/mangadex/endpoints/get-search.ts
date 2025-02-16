import axios from 'axios';

import { OpenAPIHono, z } from '@hono/zod-openapi';

import { search as route } from '@/templates';
import { EntrySchema } from '@/schemas';

import { toListManga } from '../helpers/parser';
import { BASE_URL, USER_AGENT } from '../util/constants';
import { MangaDexResponse } from '../util/types';

const endpoint = new OpenAPIHono();

endpoint.openapi(route, async (c) => {
	let { query, count, page } = c.req.query();

	count = count && count !== 'null' ? count : '60';
	page = page && page !== 'null' ? page : '0';

	try {
		const _count = parseInt(count);
		const _page = parseInt(page);

		const response = await axios.get(`${BASE_URL}/manga`, {
			params: {
				limit: _count,
				offset: _count * _page,

				availableTranslatedLanguage: ['en'],
				publicationDemographic: ['shounen', 'shoujo', 'josei', 'seinen', 'none'],
				contentRating: ['safe', 'suggestive', 'erotica', 'pornographic'],
				status: ['ongoing', 'completed', 'hiatus', 'cancelled'],
				includes: ['manga', 'cover_art'],

				// Extras
				title: query,
				order: { relevance: 'desc' }
			},
			headers: {
				'User-Agent': USER_AGENT
			}
		});

		const raw = response.data.data as Array<MangaDexResponse>;

		const total = toListManga(raw);

		z.array(EntrySchema).parse(total);

		return c.json(total, 200);
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
