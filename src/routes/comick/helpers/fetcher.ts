import axios from 'axios';
import { BASE_URL, USER_AGENT, VERSION } from '../util/constants';
import { ChapterDetailsResponse } from '../util/types';

// Add this at the top of your file, after importing axios
axios.interceptors.request.use((request) => {
  // Get the base URL from the request
  let url = request.url ?? '';

  // If there are params, format them into a query string
  if (request.params) {
    // Handle arrays properly by converting them to multiple parameters with the same name
    const queryParams = new URLSearchParams();

    // Iterate through each parameter
    Object.entries(request.params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // For array values, add multiple entries with the same key
        value.forEach((item) => {
          queryParams.append(key, item);
        });
      } else {
        // For non-array values, add a single entry
        queryParams.append(key, String(value));
      }
    });

    // Append the query string to the URL
    const queryString = queryParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  // Log the complete URL
  console.log('Request URL:', url);

  // Return the unmodified request to continue the request cycle
  return request;
});

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
