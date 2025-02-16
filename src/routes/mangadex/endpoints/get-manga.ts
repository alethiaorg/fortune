import axios from 'axios';

import { OpenAPIHono, z } from '@hono/zod-openapi';

import { detail as route } from '@/templates';
import { ChapterSchema, DetailSchema } from '@/schemas';

import { toManga } from '../helpers/parser';
import { getChapters } from '../helpers/fetcher';

import { BASE_URL, USER_AGENT } from '../util/constants';
import { MangaDexCoverResponse, MangaDexResponse, MangaDexStatisticsResponse } from '../util/types';

type Chapter = z.infer<typeof ChapterSchema>;

const endpoint = new OpenAPIHono();

endpoint.openapi(route, async (c) => {
	const { slug } = c.req.param();

	try {
		const [mangaResponse, statsResponse, coversResponse, chaptersResponse] = await Promise.all([
			// Manga
			axios.get(`${BASE_URL}/manga/${slug}`, {
				params: {
					includes: ['manga', 'cover_art', 'author', 'artist', 'tag']
				},
				headers: {
					'User-Agent': USER_AGENT
				}
			}),

			// Stats Metadata
			axios.get(`${BASE_URL}/statistics/manga`, {
				params: {
					manga: [slug]
				},
				headers: {
					'User-Agent': USER_AGENT
				}
			}),

			// Covers Metadata
			axios.get(`${BASE_URL}/cover`, {
				params: {
					manga: [slug],
					limit: 100
				},
				headers: {
					'User-Agent': USER_AGENT
				}
			}),

			// Chapters
			getChapters(slug)
		]);

		const manga = mangaResponse.data.data as MangaDexResponse;
		const stats = statsResponse.data as MangaDexStatisticsResponse;
		const covers = coversResponse.data.data as MangaDexCoverResponse;
		const chapters = chaptersResponse as Array<Chapter>;

		const detail = toManga(manga, stats, covers, chapters);

		DetailSchema.parse(detail);

		return c.json(detail, 200);
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
