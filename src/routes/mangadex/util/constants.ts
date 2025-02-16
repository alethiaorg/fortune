export const BASE_URL = 'https://api.mangadex.org';

export const REFERER = 'https://mangadex.org/';

export const USER_AGENT =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36';

export enum MangaDexContentType {
	CHAPTER = 'chapter',
	COVER_ART = 'cover_art',
	MANGA = 'manga',
	SCANLATION_GROUP = 'scanlation_group',
	TAG = 'tag'
}

export type MangadexTagType = 'genre' | 'theme' | 'format';

export type MangaDexRelationshipType =
	| 'manga'
	| 'chapter'
	| 'cover_art'
	| 'author'
	| 'artist'
	| 'scanlation_group'
	| 'tag'
	| 'user'
	| 'custom_list';

export enum MangaDexContentRating {
	SAFE = 'safe',
	SUGGESTIVE = 'suggestive',
	EROTICA = 'erotica',
	PORNOGRAPHIC = 'pornographic'
}

export enum MangaDexMangaStatus {
	ONGOING = 'ongoing',
	COMPLETED = 'completed',
	HIATUS = 'hiatus',
	CANCELLED = 'cancelled'
}
