import axios from 'axios';

import { OpenAPIHono, z } from '@hono/zod-openapi';

import { ChapterSchema, DetailSchema } from '@/schemas';
import { detail, detail as route } from '@/templates';

import { getChapters } from '../helpers/fetcher';
import { toDetail } from '../helpers/parser';
import { BASE_URL, USER_AGENT, VERSION } from '../util/constants';
import { ChapterDetailsResponse, MangaDetailsResponse } from '../util/types';

type Chapter = z.infer<typeof ChapterSchema>;

const endpoint = new OpenAPIHono();

endpoint.openapi(route, async (c) => {
  const { slug } = c.req.param();

  try {
    const [mangaResponse, chapterResponse] = await Promise.all([
      // Manga
      axios.get(`${BASE_URL}/v${VERSION}/comic/${slug}`, {
        headers: {
          'User-Agent': USER_AGENT
        }
      }),

      getChapters(slug)
    ]);

    const manga = mangaResponse.data as MangaDetailsResponse;
    const chapters = chapterResponse as Array<ChapterDetailsResponse>;

    const detail = toDetail(manga, chapters);

    DetailSchema.parse(detail);

    return c.json(detail, 200);
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return c.json({ code: 404, message: 'Manga not found' }, 404);
    }

    // Log the complete error for debugging
    console.error('Error occurred:', error);

    // If the error is from Zod validation, you can return the error details
    if (error instanceof z.ZodError) {
      return c.json({ code: 500, message: error.errors }, 500);
    }

    // Otherwise, return a generic message with the error message if available
    return c.json({ code: 500, message: error.message || 'Internal server error' }, 500);
  }
});

export default endpoint;
