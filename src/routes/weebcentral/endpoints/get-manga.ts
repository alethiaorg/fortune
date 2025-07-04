import { load } from 'cheerio';

import { OpenAPIHono, z } from '@hono/zod-openapi';

import { detail as route } from '@/templates';
import { DetailSchema } from '@/schemas';

import { BASE_URL, USER_AGENT } from '../util/constants';
import { getMangaMetadata, getOriginMetadata } from '../helpers/parser';
import { getChapters } from '../helpers/fetcher';
import { fetchWithFallback } from '@/util/flaresolverr';

type Detail = z.infer<typeof DetailSchema>;

const endpoint = new OpenAPIHono();

endpoint.openapi(route, async (c) => {
	try {
		// Use slug from request params to fetch manga details (if needed)
		const { slug } = c.req.param();

		const url = `${BASE_URL}/${slug}`;

		// Use FlareSolverr with fallback
		const html = await fetchWithFallback(url, USER_AGENT, c);

		const $ = load(html);

		const manga = getMangaMetadata($);

		const chapters = await getChapters(slug);

		const origin = getOriginMetadata($, slug, chapters);

		const result: Detail = {
			manga,
			origin,
			chapters
		};

		// validate
		DetailSchema.parse(result);

		return c.json(result, 200);
	} catch (error: any) {
		// Handle Network Errors
		if (error.message?.includes('404') || (error.response && error.response.status === 404)) {
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