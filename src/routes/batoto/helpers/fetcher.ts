import { ChapterSchema } from '@/schemas';
import { encodeUri } from '@/util';
import { z } from '@hono/zod-openapi';
import axios from 'axios';
import { load } from 'cheerio';
import { BASE_URL, USER_AGENT } from '../utils/constants';

type Chapter = z.infer<typeof ChapterSchema>;

export const getChapters = async (slug: string): Promise<Array<Chapter>> => {
  console.log('Fetching chapters for slug:', slug);
  const { data: html } = await axios.get(`${BASE_URL}/title/${slug}`, {
    headers: {
      'User-Agent': USER_AGENT
    }
  });

  const $ = load(html);
  const chapters: Array<Chapter> = [];

  $('div[name="chapter-list"] astro-slot > div').each((i, el) => {
    const chapterContainer = $(el);

    let chapterDate: Date;
    const timeElem = chapterContainer.find('time');
    if (timeElem.length === 0) {
      throw new Error('No chapter date element found.');
    }

    const timeAttr = timeElem.attr('time');
    if (timeAttr) {
      chapterDate = new Date(timeAttr);
      if (isNaN(chapterDate.getTime())) {
        throw new Error(`Chapter date is invalid from time attribute: ${timeAttr}`);
      }
    } else {
      // Fallback: parse the relative date from the text
      chapterDate = parseRelativeDate(timeElem.text().trim());
      if (isNaN(chapterDate.getTime())) {
        throw new Error(`Chapter date is invalid from relative text: ${timeElem.text().trim()}`);
      }
    }

    // Get the scanlator text from the scanlator container
    let scanlator = chapterContainer.find('.ml-auto.inline-flex a.link-primary').first().text().trim().replace('[BANNED].', ''); // lol if banned user this is what is prepended to their name
    if (!scanlator) {
      scanlator = 'bato.to';
    }

    const chapterAnchor = chapterContainer.find('div.space-x-1 > a');

    const chapterName = chapterContainer.find('div.space-x-1').first().text().trim();

    const chapterHref = chapterAnchor.attr('href')?.trim() || '';
    const match = chapterHref.match(/ch_(\d+(\.\d+)?)/i);
    if (!match) {
      throw new Error(`Chapter number not found in href: ${chapterHref}`);
    }
    const chapterNumber = parseFloat(match[1]);

    const idMatch = chapterHref.match(/\/title\/[^\/]+\/([^\/]+)-ch_/i);
    if (!idMatch) {
      throw new Error(`Chapter id not found in href: ${chapterHref}`);
    }
    const chapterId = idMatch[1];

    // Build the final chapter slug by combining the original slug and the extracted chapter id.
    const finalSlug = `${slug}/${chapterId}`;

    chapters.push({
      slug: encodeUri(finalSlug),
      title: chapterName,
      number: chapterNumber,
      date: new Date(chapterDate),
      scanlator: scanlator
    });
  });

  return chapters;
};

const parseRelativeDate = (relative: string): Date => {
  const now = new Date();
  const parts = relative.split(' ');
  if (parts.length < 3) return now;

  const num = parseFloat(parts[0]);
  const unit = parts[1].toLowerCase();
  const result = new Date(now.getTime());

  if (unit.includes('minute')) {
    result.setMinutes(result.getMinutes() - num);
  } else if (unit.includes('hour')) {
    result.setHours(result.getHours() - num);
  } else if (unit.includes('day')) {
    result.setDate(result.getDate() - num);
  } else if (unit.includes('month')) {
    result.setMonth(result.getMonth() - num);
  } else if (unit.includes('year')) {
    result.setFullYear(result.getFullYear() - num);
  }
  return result;
};
