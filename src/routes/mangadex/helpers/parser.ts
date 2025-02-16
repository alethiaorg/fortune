import {
	// Base
	UUID,
	LanguageBase,

	// Manga
	MangaDexResponse,
	MangaDexResponseRelationship,
	CoverArtRelationship,
	MangadexTagRelationship,

	// Stats
	MangaDexStatisticsResponse,
	MangaDexStatistics,
	MangaDexChaptersResponse,
	MangaDexChapterRelationship,
	MangaDexChapterData,
	MangaDexCoverResponse
} from '../util/types';
import { REFERER } from '../util/constants';

import { slugs } from '@/constants';

// ----------------------------------------------------
// Helpers
// ----------------------------------------------------

const SOURCE_URL = 'https://mangadex.org/title/';

import { z } from '@hono/zod-openapi';
import {
	ChapterSchema,
	ClassificationSchema,
	DetailSchema,
	EntrySchema,
	PublishStatusSchema
} from '@/schemas';

type Detail = z.infer<typeof DetailSchema>;
type Chapter = z.infer<typeof ChapterSchema>;
type Entry = z.infer<typeof EntrySchema>;

const resolveLanguage = (lang: LanguageBase, defaultValue: string = ''): string =>
	lang.en ||
	lang.ja_ro ||
	lang.kr_ro ||
	lang.ja ||
	lang.kr ||
	Object.values(lang).find((value) => value) ||
	defaultValue;

// ----------------------------------------------------
// Base
// ----------------------------------------------------

export const toManga = (
	raw: MangaDexResponse,
	stats: MangaDexStatisticsResponse,
	covers: MangaDexCoverResponse,
	chapters?: Array<Chapter>
): Detail => {
	return {
		manga: {
			title: getMangaTitle(raw.attributes.title),
			authors: getMangaAuthors(raw.relationships),
			synopsis: getMangaSynopsis(raw.attributes.description),
			alternativeTitles: getMangaAlternativeTitles(raw.attributes.altTitles),
			tags: getMangaTags(raw.attributes.tags)
		},
		origin: {
			slug: raw.id,
			url: SOURCE_URL + raw.id,
			referer: REFERER,
			rating: getMangaRating(raw.id, stats.statistics),
			covers: getMangaCovers(raw.id, covers),
			status: PublishStatusSchema.parse(raw.attributes.status ?? 'Unknown'),
			classification: ClassificationSchema.parse(raw.attributes.contentRating ?? 'Unknown'),
			creation: new Date(raw.attributes.createdAt ?? 0)
		},
		chapters: chapters ? chapters : []
	};
};

export const toChapterList = (raw: MangaDexChaptersResponse): Array<Chapter> => {
	return raw.data.map((chapter) => {
		const title =
			// If null or empty default to rhs value
			chapter.attributes.title && chapter.attributes.title.trim() !== ''
				? chapter.attributes.title
				: `Chapter ${getChapterNumber(chapter)}`;

		return {
			title,
			slug: chapter.id,
			number: getChapterNumber(chapter),
			scanlator: getScanlationGroup(chapter.relationships),
			date: new Date(chapter.attributes.readableAt ?? 0)
		};
	});
};

export const toListManga = (raw: Array<MangaDexResponse>): Array<Entry> => {
	return raw.map((x) => {
		let formatted: Entry = {
			slug: x.id,
			title: getMangaTitle(x.attributes.title),
			cover: getMangaCovers(
				x.id,
				x.relationships.filter((rel) => rel.type === 'cover_art')
			)[0]
		};

		return formatted;
	});
};

// ----------------------------------------------------
// Helper Private Functions
// ----------------------------------------------------

const getMangaTitle = (title: LanguageBase): string => resolveLanguage(title);

const getMangaAlternativeTitles = (titles: Array<LanguageBase>): Array<string> =>
	titles.map((title) => resolveLanguage(title));

const getMangaAuthors = (relationships: Array<MangaDexResponseRelationship>): Array<string> => {
	return relationships
		.filter((relationship) => relationship.type === 'author' || relationship.type === 'artist')
		.map((relationship) => relationship.attributes.name);
};

const getMangaSynopsis = (description: LanguageBase): string => {
	return resolveLanguage(description, 'No Description.');
};

const getMangaTags = (tags: Array<MangadexTagRelationship>): Array<string> =>
	tags.map((tag) => resolveLanguage(tag.attributes.name));

const getMangaCovers = (id: UUID, covers?: Array<CoverArtRelationship>): Array<string> => {
	const result: Array<string> = [];

	covers?.forEach((cover) => {
		result.push(`https://mangadex.org/covers/${id}/${cover.attributes.fileName}`);
	});

	if (result.length === 0) {
		result.push('https://placehold.co/120x180/png');
	}

	return result;
};

const getMangaRating = (id: UUID, stats: { [id: string]: MangaDexStatistics }): number =>
	(stats[id]?.rating?.average ?? 0) / 2;

const getChapterNumber = (chapter: MangaDexChapterData): number =>
	chapter.attributes.chapter ? parseFloat(chapter.attributes.chapter) : 0;

const getScanlationGroup = (rels: Array<MangaDexChapterRelationship>): string =>
	rels.find((rel) => rel.type === 'scanlation_group')?.attributes.name || 'MangaDex';

const getChapterMangaSlug = (raw: MangaDexChaptersResponse): UUID =>
	raw.data[0].relationships.find((rel) => rel.type === 'manga')?.id || '';
