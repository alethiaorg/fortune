import { ChapterSchema, DetailSchema, EntrySchema, MangaSchema, OriginSchema } from '@/schemas';
import { z } from '@hono/zod-openapi';
import { BASE_URL, IMAGE_URL_BASE, REFERER } from '../util/constants';
import { ChapterDetailsResponse, MangaDetailsResponse, MangaStatus, SearchResultItem } from '../util/types';

type Manga = z.infer<typeof MangaSchema>;
type Origin = z.infer<typeof OriginSchema>;
type Detail = z.infer<typeof DetailSchema>;
type Chapter = z.infer<typeof ChapterSchema>;
type Entry = z.infer<typeof EntrySchema>;

export const toListManga = (raw: Array<SearchResultItem>): Array<Entry> => {
  console.log('Raw: ', typeof raw);
  return raw.map((x) => {
    let formatted: Entry = {
      slug: x.hid,
      title: x.title,
      cover: `${IMAGE_URL_BASE}/${x.md_covers[0].b2key ?? ''}`
    };

    return formatted;
  });
};

export const toDetail = (manga: MangaDetailsResponse, chaptersResponse: Array<ChapterDetailsResponse>): Detail => {
  const tags = [
    // Extract genre names from md_comic_md_genres
    ...manga.comic.md_comic_md_genres.map((genre) => genre.md_genres.name),

    // Extract category titles from mu_comic_categories if they exist
    ...(manga.comic.mu_comics?.mu_comic_categories.map((category) => category.mu_categories.title) || [])
  ]
    // Filter out duplicates by creating a Set and converting back to array
    .filter((tag, index, self) => self.indexOf(tag) === index);

  const main: Manga = {
    title: manga.comic.title,
    authors: manga.authors.map((x) => x.name),
    synopsis: manga.comic.desc,
    alternativeTitles: manga.comic.md_titles.map((x) => x.title),
    tags
  };

  const origin: Origin = {
    status: (() => {
      switch (manga.comic.status) {
        case MangaStatus.Ongoing:
          return 'Ongoing';
        case MangaStatus.Completed:
          return 'Completed';
        case MangaStatus.Cancelled:
          return 'Cancelled';
        case MangaStatus.Hiatus:
          return 'Hiatus';
        default:
          return 'Unknown';
      }
    })(),
    slug: manga.comic.hid,
    url: `${BASE_URL}/comic/${manga.comic.hid}`,
    referer: REFERER,
    covers: manga.comic.md_covers.map((x) => `${IMAGE_URL_BASE}/${x.b2key}`),
    classification: (() => {
      switch (manga.comic.content_rating) {
        case 'safe':
          return 'Safe';
        case 'suggestive':
          return 'Suggestive';
        case 'erotica':
          return 'Explicit';
        default:
          return 'Unknown';
      }
    })(),
    creation: new Date(Date.UTC(manga.comic.year, 0, 1))
  };

  const chapters: Array<Chapter> = chaptersResponse
    .flatMap((response) => response.chapters)
    .map((chapter) => {
      return {
        title: chapter.title || `Chapter ${chapter.chap}`, // Use chapter number if title is null
        slug: chapter.hid, // Create slug from id
        number: parseFloat(chapter.chap), // Convert string chapter number to float
        scanlator: chapter.md_chapters_groups.length > 0 ? chapter.md_chapters_groups[0].md_groups.title : 'ComicK', // Get first scanlator
        date: new Date(chapter.created_at) // Convert string date to Date object
      };
    })
    // sort chapters in descending order
    .sort((a, b) => b.number - a.number);

  return {
    manga: main,
    origin,
    chapters
  };
};
