import axios from 'axios';
import { CheerioAPI, load } from 'cheerio';

import { z } from '@hono/zod-openapi';
import { ChapterSchema } from '@/schemas';

import { BASE_MANGA_URL, USER_AGENT } from '../util/constants';

type Chapter = z.infer<typeof ChapterSchema>;

export const getChapters = async (
	slug: string,
	prefetched?: CheerioAPI
): Promise<Array<Chapter>> => {
	const endpoint = `${BASE_MANGA_URL}/${slug}`;

	var $ = prefetched;

	if (!$) {
		const { data: html } = await axios.get(endpoint, { headers: { 'User-Agent': USER_AGENT } });
		$ = load(html);
	}

	const chapters: Array<Chapter> = [];

	$('ul.row-content-chapter li.a-h').each((_, element) => {
		const chapterElement = $!(element);
		const chapterAnchor = chapterElement.find('a.chapter-name');
		const href = chapterAnchor.attr('href');

		if (!href) {
			console.log('Skipping chapter: missing href attribute.');
			return;
		}

		/**
		 * Extract chapter number from href using regex
		 * For example, given "https://chapmanganato.to/manga-dr980474/chapter-107.5"
		 * the regex captures "107.5"
		 */
		const chapterMatch = href.match(/chapter-([\d.]+)/i);
		const chapterNumber = chapterMatch ? parseFloat(chapterMatch[1]) : NaN;

		if (isNaN(chapterNumber)) {
			console.log('Skipping chapter with invalid chapter number.');
			return;
		}

		const chapterTitle = chapterAnchor.text().trim();
		const chapterDateText = chapterElement.find('.chapter-time').attr('title') ?? -1;

		const chapter: Chapter = {
			slug: `${slug}/chapter-${chapterNumber}`,
			title: chapterTitle,
			number: chapterNumber,
			scanlator: 'manganato',
			date: new Date(chapterDateText ?? 0)
		};

		chapters.push(chapter);
	});

	return chapters;
};
