import axios from 'axios';
import { BASE_URL, USER_AGENT, VERSION } from '../util/constants';
import { ChapterDetailsResponse } from '../util/types';

export async function getChapters(slug: string): Promise<ChapterDetailsResponse[]> {
  const results: ChapterDetailsResponse[] = [];
  let page = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const { data } = await axios.get(`${BASE_URL}/comic/${slug}/chapters`, {
        params: {
          lang: 'en',
          page: page
        },
        headers: {
          'User-Agent': USER_AGENT
        }
      });

      results.push(data);

      // Check if we've reached the last page
      const totalChapters = data.total;
      const fetchedChapters = results.reduce((count, response) => count + response.chapters.length, 0);

      if (fetchedChapters >= totalChapters || data.chapters.length === 0) {
        hasMorePages = false;
      } else {
        page++;
      }

      // small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error fetching chapters page ${page}:`, error);
      hasMorePages = false;
    }
  }

  return results;
}
