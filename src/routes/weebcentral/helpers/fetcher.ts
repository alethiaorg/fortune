import { load } from 'cheerio';

import { z } from '@hono/zod-openapi';
import { ChapterSchema } from '@/schemas';
import { encodeUri } from '@/util';

import { BASE_URL, USER_AGENT } from '../util/constants';
import { fetchWithFallback } from '@/util/flaresolverr';

type Chapter = z.infer<typeof ChapterSchema>;

export const getChapters = async (slug: string): Promise<Array<Chapter>> => {
	const endpoint = `${BASE_URL}/${slug}/full-chapter-list`;

	// Use FlareSolverr with fallback
	const html = await fetchWithFallback(endpoint, USER_AGENT);
	const $ = load(html);

	const chapters: Array<Chapter> = [];
	$('div.flex.items-center').each((_, element) => {
		const chapterTitle = $(element).find('span[class=""]').first().text().trim();
		console.log('Chapter Title: ', chapterTitle);

		const match = chapterTitle.match(/\b\d+\b/);

		if (!match) {
			throw new Error('No standalone chapter number found.');
		}

		const chapterNumber = parseInt(match[0], 10);
		console.log('Chapter Number: ', chapterNumber);

		if (isNaN(chapterNumber)) {
			throw new Error('Chapter number is not parsable.');
		}

		const href = $!(element).find('a').attr('href');
		var chapterSlug = '';
		if (href && href.includes('/chapters/')) {
			// Get the substring after "/chapters/"
			chapterSlug = href.split('/chapters/')[1];
		} else {
			throw new Error(`No valid href found for chapter with title: ${chapterTitle}`);
		}

		const dateValue = $!(element).find('time.text-datetime').attr('datetime') || '';

		const chapter: Chapter = {
			slug: encodeUri(`chapters/${chapterSlug}`),
			title: chapterTitle,
			number: chapterNumber,
			scanlator: 'weebcentral',
			date: new Date(dateValue)
		};

		chapters.push(chapter);
	});

	return chapters;
};