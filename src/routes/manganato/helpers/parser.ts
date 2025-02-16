import { CheerioAPI } from 'cheerio';

import { z } from '@hono/zod-openapi';

import { ChapterSchema, MangaSchema, OriginSchema } from '@/schemas';
import { BASE_MANGA_URL, REFERER } from '../util/constants';

type Manga = z.infer<typeof MangaSchema>;
type Origin = z.infer<typeof OriginSchema>;
type Chapter = z.infer<typeof ChapterSchema>;

export const getMangaMetadata = ($: CheerioAPI): Manga => {
	const title = $('.panel-story-info .story-info-right h1').text().trim();
	const authors = $('td:has(.info-author)')
		.next('td.table-value')
		.find('a.a-h')
		.map((_, el) => $(el).text().trim())
		.get();

	const synopsis = $('#panel-story-info-description').text().replace('Description :', '').trim();

	const alternativeTitles = $('td:has(.info-alternative)')
		.next('td.table-value')
		.text()
		.split(';')
		.map((title) => title.trim());

	const tags = $('td:has(.info-genres)')
		.next('td.table-value')
		.find('a.a-h')
		.map((_, el) => $(el).text().trim())
		.get();

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
	chapters: Array<Chapter>,
	tags: Array<string>
): Origin => {
	const url = `${BASE_MANGA_URL}/${slug}`;

	const referer = REFERER;

	// Only 1 cover in this source
	const cover = $('.story-info-left .info-image img').attr('src') || '';

	const status = (() => {
		switch ($('td:has(.info-status)').next('td.table-value').text().trim()) {
			// TODO: Find proof of other status values
			case 'Ongoing':
				return 'Ongoing';
			case 'Completed':
				return 'Completed';
			default:
				return 'Unknown';
		}
	})();

	const classification = getClassification(tags);

	const creation =
		chapters.length > 0
			? chapters
					//@ts-ignore
					.reduce((earliest, chapter: Chapter) => {
						const chapterDate = new Date(chapter.date);
						return chapterDate < earliest ? chapterDate : earliest;
					}, new Date())
					.toISOString()
			: new Date(0).toISOString();

	return {
		slug,
		url,
		referer,
		covers: [cover],
		status,
		classification,
		creation: new Date(creation)
	};
};

export const getUpdatedAt = ($: CheerioAPI): string => {
	const updatedLabel = $('span.stre-label')
		.filter((_, el) => $(el).text().includes('Updated'))
		.first();

	// If the 'Updated' label is not found, return null
	if (!updatedLabel.length) {
		return new Date(-1).toISOString();
	}

	const dateText = updatedLabel.next('span.stre-value').text().trim();

	const [datePart, timePart] = dateText.split(' - ');
	if (!datePart || !timePart) {
		return new Date(-1).toISOString();
	}

	const parsedDate = new Date(datePart);

	let [time, period] = timePart.split(' ');

	let [hours, minutes] = time.split(':').map(Number);

	if (period.toUpperCase() === 'AM') {
		if (hours === 12) hours = 0; // Midnight
	} else if (period.toUpperCase() === 'PM') {
		if (hours !== 12) hours += 12; // Afternoon and evening
	}

	const finalDate = new Date(
		parsedDate.getFullYear(),
		parsedDate.getMonth(),
		parsedDate.getDate(),
		hours,
		minutes
	);

	return finalDate.toISOString();
};

function getClassification(input: Array<string>): 'Unknown' | 'Safe' | 'Suggestive' | 'Explicit' {
	// 1. If input is empty, return "Unknown"
	if (input.length === 0) {
		return 'Unknown';
	}

	// Define the tags that map to each classification:
	const explicitTags = ['pornographic', 'erotica'];
	const suggestiveTags = ['smut', 'echi'];

	// 2. If the tag "pornographic" or "erotica" is present, return "Explicit"
	//    (check case-insensitively by converting to lowercase)
	if (input.some((tag) => explicitTags.includes(tag.toLowerCase()))) {
		return 'Explicit';
	}

	// 3. If the tag "smut" or "echi" is present, return "Suggestive"
	if (input.some((tag) => suggestiveTags.includes(tag.toLowerCase()))) {
		return 'Suggestive';
	}

	// 4. Otherwise, return "Safe"
	return 'Safe';
}

export function isPageGreaterThanLast($: CheerioAPI, currentPage: number): boolean {
	try {
		// Find the <a> tag with class "page-blue page-last"
		const lastPageLink = $('.page-blue.page-last');

		if (lastPageLink.length) {
			const lastPageText = lastPageLink.text();

			if (lastPageText.startsWith('LAST(') && lastPageText.endsWith(')')) {
				const lastPageNumber = Number(lastPageText.slice(5, -1));

				if (!isNaN(lastPageNumber)) {
					return currentPage > lastPageNumber;
				}
			}
		}

		return false;
	} catch (error) {
		console.error('Error parsing last page number:', error);
		return false;
	}
}
