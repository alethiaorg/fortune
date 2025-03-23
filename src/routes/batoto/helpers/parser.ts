import { CheerioAPI } from 'cheerio';

import { z } from '@hono/zod-openapi';

import { ChapterSchema, MangaSchema, OriginSchema } from '@/schemas';
import { encodeUri } from '@/util';
import { BASE_URL, REFERER } from '../utils/constants';

type Manga = z.infer<typeof MangaSchema>;
type Origin = z.infer<typeof OriginSchema>;
type Chapter = z.infer<typeof ChapterSchema>;

export const getMangaMetadata = ($: CheerioAPI): Manga => {
  const title = $('h3.text-lg.md\\:text-2xl.font-bold a.link.link-hover').text().trim();

  const authors: Array<string> = [];

  const uniqueAuthors = new Set();

  $('div.mt-2.text-sm.md\\:text-base a.link.link-hover.link-primary').each((_, element) => {
    let author = $(element).text()?.trim() ?? '';

    // Remove "(Art)" for artists
    author = author.replace('(Art)', '').trim();

    if (author) {
      uniqueAuthors.add(author);
    }
  });

  authors.push(...(Array.from(uniqueAuthors) as string[]));

  const synopsis = $('meta[name="description"]').attr('content')?.trim() ?? 'No Description.';

  const alternativeTitles: Array<string> = [];
  const uniqueTitles = new Set<string>();

  $('div.mt-1.text-xs.md\\:text-base.opacity-80 span').each((_, element) => {
    const altTitle = $(element).text().trim();

    // Skip separator characters and empty strings
    if (altTitle === '/' || altTitle === ',' || altTitle === '-' || altTitle === '' || !altTitle) {
      return;
    }

    // Only add if not already in the set (prevents duplicates)
    if (!uniqueTitles.has(altTitle)) {
      uniqueTitles.add(altTitle);
      alternativeTitles.push(altTitle);
    }
  });

  const tags: Array<string> = [];

  if ($('div.flex.items-center.flex-wrap b:contains("Genres:")').length > 0) {
    const uniqueGenres = new Set();

    $('div.flex.items-center.flex-wrap span').each((_, element) => {
      let genre = $(element).text().trim();

      genre = genre.replace(/\(.*?\)/g, '').trim();

      if (genre && /^[a-zA-Z]+$/.test(genre)) {
        uniqueGenres.add(genre);
      }
    });

    tags.push(...(Array.from(uniqueGenres) as string[]));
  }

  return {
    title,
    authors,
    synopsis,
    alternativeTitles,
    tags
  };
};

export const getOriginMetadata = ($: CheerioAPI, slug: string, chapters: Array<Chapter>): Origin => {
  // This source only has 1 cover
  const cover = $('meta[property="og:image"]').attr('content') ?? '';

  let status = $('div span.font-bold.uppercase.text-success').first().text().trim();
  const availableStatusOptions = ['Ongoing', 'Completed', 'Hiatus', 'Cancelled', 'Unknown'];

  if (!availableStatusOptions.includes(status)) {
    status = 'Unknown';
  }

  const classification = getClassification($);

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
    classification: classification as 'Unknown' | 'Safe' | 'Suggestive' | 'Explicit',
    creation: new Date(creation)
  };
};

const getClassification = ($: CheerioAPI): 'Unknown' | 'Safe' | 'Suggestive' | 'Explicit' => {
  try {
    const tags: Array<string> = [];
    if ($('div.flex.items-center.flex-wrap b:contains("Genres:")').length > 0) {
      const uniqueGenres = new Set();

      $('div.flex.items-center.flex-wrap span').each((_, element) => {
        let genre = $(element).text().trim();
        genre = genre.replace(/$$.*?$$/g, '').trim();

        // Allow alphabetic characters and spaces for multi-word genres
        if (genre && /^[a-zA-Z\s]+$/.test(genre)) {
          uniqueGenres.add(genre);
        }
      });

      tags.push(...(Array.from(uniqueGenres) as string[]));
    }
    const explicitTags = ['Hentai', 'Adult', 'Smut', 'Explicit', 'Gore', 'Bloody'];
    const matureTags = ['Mature', 'Ecchi', 'Violence'];

    // Check if any explicit tags are present
    const hasExplicitTags = tags.some((tag) => explicitTags.includes(tag));
    const hasMatureTags = tags.some((tag) => matureTags.includes(tag));

    // Determine classification with priority order
    if (hasExplicitTags) {
      return 'Explicit';
    }

    if (hasMatureTags) {
      return 'Suggestive';
    }

    return 'Safe';
  } catch {
    return 'Unknown';
  }
};
