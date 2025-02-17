import { CheerioAPI } from 'cheerio';

import { z } from '@hono/zod-openapi';

import { encodeUri } from '@/util';
import { ChapterSchema, MangaSchema, OriginSchema } from '@/schemas';
import { BASE_URL, REFERER } from '../util/constants';

type Manga = z.infer<typeof MangaSchema>;
type Origin = z.infer<typeof OriginSchema>;
type Chapter = z.infer<typeof ChapterSchema>;

export const getMangaMetadata = ($: CheerioAPI): Manga => {
	const title = $('h1.md\\:hidden.text-2xl.font-bold.text-center').text().trim();

	const authors: Array<string> = [];
	$('li:contains("Author(s):") span a').each((_, element) => {
		authors.push($(element).text().trim());
	});

	const synopsis = $('li:contains("Description") p').text().trim();

	// No alt titles available for this source
	const alternativeTitles: Array<string> = [];

	const tags: Array<string> = [];
	$('li:contains("Tags(s):") span a').each((_, element) => {
		tags.push($(element).text().trim());
	});

	return {
		title,
		authors,
		synopsis,
		alternativeTitles,
		tags
	};
};

export const getOriginMetadata = (
	$: CheerioAPI,
	slug: string,
	chapters: Array<Chapter>
): Origin => {
	// This source only has 1 cover
	const cover = $('meta[property="og:image"]').attr('content') ?? '';

	let status = $('li:contains("Status:") a').text().trim();
	const availableStatusOptions = ['Ongoing', 'Completed', 'Hiatus', 'Cancelled', 'Unknown'];
	if (!availableStatusOptions.includes(status)) {
		status = 'Unknown';
	}

	let classification = $('li:contains("Adult Content:") a').text().trim();
	if (classification.toLowerCase() === 'yes') {
		classification = 'Explicit';
	} else if (classification.toLowerCase() === 'no') {
		classification = 'Safe';
	} else {
		classification = 'Unknown';
	}

	const creation =
		chapters.length > 0
			? chapters
					.reduce((earliest, chapter: Chapter) => {
						const chapterDate = new Date(chapter.date);
						return chapterDate < earliest ? chapterDate : earliest;
					}, new Date())
					.toISOString()
			: new Date(0).toISOString();

	return {
		slug: encodeUri(slug),
		url: `${BASE_URL}/series/${slug}`,
		referer: REFERER,
		covers: [cover],
		status: status as 'Unknown' | 'Ongoing' | 'Completed' | 'Cancelled' | 'Hiatus',
		classification: classification as 'Unknown' | 'Safe' | 'Explicit',
		creation: new Date(creation)
	};
};
