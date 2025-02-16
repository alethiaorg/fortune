import axios from 'axios';
import { CheerioAPI, load } from 'cheerio';

import { z } from '@hono/zod-openapi';
import { ChapterSchema } from '@/schemas';

import { BASE_URL, USER_AGENT } from '../util/constants';

type Chapter = z.infer<typeof ChapterSchema>;

export const getChapters = async (slug: string): Promise<Array<Chapter>> => {
	const endpoint = `${BASE_URL}/series/${slug}/full-chapter-list`;

	const { data: html } = await axios.get(endpoint, { headers: { 'User-Agent': USER_AGENT } });
	const $ = load(html);

	const prefix = 'Chapter ';
	const chapters: Array<Chapter> = [];

	$('div.flex.items-center').each((_, element) => {
		const chapterTitle = $!(element).find('span[class=""]').first().text().trim();

		const chapterNumber = parseInt(chapterTitle.slice(prefix.length), 10);

		console.log('Chapter Title: ', chapterTitle);
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
			slug: `chapters/${chapterSlug}`,
			title: chapterTitle,
			number: chapterNumber,
			scanlator: 'weebcentral',
			date: new Date(dateValue)
		};

		chapters.push(chapter);
	});

	return chapters;
};
