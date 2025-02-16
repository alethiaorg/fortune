import {
	MangaDexContentRating,
	MangaDexContentType,
	MangaDexMangaStatus,
	MangaDexRelationshipType,
	MangadexTagType
} from './constants';

// ----------------------------------------------------
// Base
// ----------------------------------------------------

export type UUID = string;

export interface LanguageBase {
	en?: string;
	ja_ro?: string;
	kr_ro?: string;
	ja?: string;
	kr?: string;
	[key: string]: string | undefined;
}

// ----------------------------------------------------
// Manga
// ----------------------------------------------------

export interface MangaDexResponse {
	id: UUID;
	type: MangaDexContentType;
	attributes: MangaDexResponseAttributes;
	relationships: Array<MangaDexResponseRelationship>;
}

export interface MangaDexResponseAttributes {
	title: LanguageBase;
	altTitles: Array<LanguageBase>;
	description: LanguageBase;
	status: MangaDexMangaStatus;
	contentRating: MangaDexContentRating;
	tags: Array<MangadexTagRelationship>;
	createdAt: Date;
	updatedAt: Date;
}

export type MangaDexResponseRelationship =
	| AuthorRelationship
	| ArtistRelationship
	| CoverArtRelationship;

export interface MangaDexResponseRelationshipBase {
	id: UUID;
	type: MangaDexRelationshipType;
}

export interface AuthorRelationship extends MangaDexResponseRelationshipBase {
	type: 'author';
	attributes: AuthorAttributes;
}

export interface ArtistRelationship extends MangaDexResponseRelationshipBase {
	type: 'artist';
	attributes: ArtistAttributes;
}

export interface CoverArtRelationship extends MangaDexResponseRelationshipBase {
	type: 'cover_art';
	attributes: CoverArtAttributes;
}

export interface MangadexTagRelationship extends MangaDexResponseRelationshipBase {
	type: 'tag';
	attributes: {
		name: LanguageBase;
	};
	group: MangadexTagType;
}

export interface AuthorAttributes {
	name: string;
	imageUrl: string | null;
	biography: Record<string, any>;
	twitter: string | null;
	pixiv: string | null;
	melonBook: string | null;
	fanBox: string | null;
	booth: string | null;
	namicomi: string | null;
	nicoVideo: string | null;
	skeb: string | null;
	fantia: string | null;
	tumblr: string | null;
	youtube: string | null;
	weibo: string | null;
	naver: string | null;
	website: string | null;
	createdAt: string;
	updatedAt: string;
	version: number;
}

export interface ArtistAttributes {
	name: string;
	imageUrl: string | null;
	biography: Record<string, any>;
	twitter: string | null;
	pixiv: string | null;
	melonBook: string | null;
	fanBox: string | null;
	booth: string | null;
	namicomi: string | null;
	nicoVideo: string | null;
	skeb: string | null;
	fantia: string | null;
	tumblr: string | null;
	youtube: string | null;
	weibo: string | null;
	naver: string | null;
	website: string | null;
	createdAt: string;
	updatedAt: string;
	version: number;
}

export interface CoverArtAttributes {
	description: string;
	volume: string | null;
	fileName: string;
	locale: string;
	createdAt: string;
	updatedAt: string;
	version: number;
}

// ----------------------------------------------------
// Chapters
// ----------------------------------------------------

export interface MangaDexChaptersResponse {
	result: 'ok' | 'error';
	response: 'collection';
	data: Array<MangaDexChapterData>;
	limit: number;
	offset: number;
	total: number;
}

export interface MangaDexChapterData {
	id: UUID;
	type: 'chapter';
	attributes: MangaDexChapterAttributes;
	relationships: Array<MangaDexChapterRelationship>;
}

interface MangaDexChapterAttributes {
	title: string;
	volume: string;
	chapter: string;
	pages: number;
	translatedLanguage: 'en';
	readableAt: Date; // Using readable as date prop
}

export type MangaDexChapterRelationship = MangaRelationship | ScanlationGroupRelationship;

export interface MangaRelationship {
	id: UUID;
	type: 'manga';
}

export interface ScanlationGroupRelationship {
	id: UUID;
	type: 'scanlation_group';
	attributes: ScanlationGroupAttributes;
}

interface ScanlationGroupAttributes {
	name: string;
	altNames: Array<string>;
	locked: boolean;
	website: string | null;
	ircServer: string | null;
	ircChannel: string | null;
	discord: string | null;
	contactEmail: string | null;
	description: string;
	twitter: string | null;
	mangaUpdates: string | null;
	focusedLanguages: Array<string>;
	official: boolean;
	verified: boolean;
	inactive: boolean;
	publishDelay: string | null;
	exLicensed: boolean;
	createdAt: Date;
	updatedAt: Date;
	version: number;
}

// ----------------------------------------------------
// Statistics
// ----------------------------------------------------

export interface MangaDexStatisticsResponse {
	result: 'ok' | 'error';
	statistics: {
		// Expect ID of called manga ID here
		[id: string]: MangaDexStatistics;
	};
}

export interface MangaDexStatistics {
	comments: {
		threadId: number;
		repliesCount: number;
	};
	follows: number;
	rating: {
		average: number;
		bayesian: number;
	};
}

// ----------------------------------------------------
// Cover
// ----------------------------------------------------

export type MangaDexCoverResponse = Array<CoverArtRelationship>;
