import axios from 'axios';
import { z } from '@hono/zod-openapi';
import { ChapterSchema } from '@/schemas';

import { toChapterList } from './parser';
import { BASE_URL, USER_AGENT } from '../util/constants';
import { MangaDexChaptersResponse } from '../util/types';

type Chapter = z.infer<typeof ChapterSchema>;

export const getChapters = async (slug: string): Promise<Array<Chapter>> => {
	let offset = 0;
	const limit = 100;
	let results: Array<Chapter> = [];
	let total = 0;

	do {
		const response = await axios.get(`${BASE_URL}/manga/${slug}/feed`, {
			params: {
				limit: limit,
				offset: offset,
				translatedLanguage: ['en'],
				contentRating: ['safe', 'suggestive', 'erotica', 'pornographic'],
				order: {
					createdAt: 'desc',
					updatedAt: 'desc',
					publishAt: 'desc',
					readableAt: 'desc',
					volume: 'desc',
					chapter: 'desc'
				},
				includes: ['scanlation_group']
			},
			headers: {
				'User-Agent': USER_AGENT
			}
		});

		const raw = response.data as MangaDexChaptersResponse;

		const formatted = toChapterList(raw);

		results = [...results, ...formatted];

		total = response.data.total;
		offset += limit;
	} while (offset < total);

	return results;
};
