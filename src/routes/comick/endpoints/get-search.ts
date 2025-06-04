import axios from 'axios';

import { OpenAPIHono, z } from '@hono/zod-openapi';

import { EntrySchema } from '@/schemas';
import { route } from '@/templates';

import { toListManga } from '../helpers/parser';
import { BASE_URL, USER_AGENT, VERSION } from '../util/constants';
import { SearchResultItem } from '../util/types';

const endpoint = new OpenAPIHono();

endpoint.openapi(route, async (c) => {
  let { page, query } = c.req.query();

  page = page && page !== 'null' ? page : '1';

  try {
    const _page = Math.max(1, parseInt(page));

    const response = await axios.get(`${BASE_URL}/v${VERSION}/search`, {
      params: {
        country: ['jp', 'kr', 'cn', 'others'],
        page: _page,
        q: query
      },
      headers: {
        'User-Agent': USER_AGENT
      }
    });

    const raw = response.data as Array<SearchResultItem>;

    const total = toListManga(raw);

    z.array(EntrySchema).parse(total);

    return c.json(total, 200);
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
