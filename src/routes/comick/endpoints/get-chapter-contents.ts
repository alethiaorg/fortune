import { chapterContents as route } from '@/templates';
import { OpenAPIHono, z } from '@hono/zod-openapi';
import axios from 'axios';

import { BASE_URL, IMAGE_URL_BASE, USER_AGENT } from '../util/constants';
import { ChapterContentResponse } from '../util/types';

const endpoint = new OpenAPIHono();

endpoint.openapi(route, async (c) => {
  try {
    const { slug } = c.req.param();

    const response = await axios.get(`${BASE_URL}/chapter/${slug}/get_images`, {
      headers: { 'User-Agent': USER_AGENT }
    });

    const data = response.data as Array<ChapterContentResponse>;

    const urls = data.map((item) => `${IMAGE_URL_BASE}/${item.b2key}`);

    z.array(z.string()).parse(urls);

    return c.json(urls);
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return c.json({ code: 404, message: 'Manga not found' }, 404);
    }

    if (error instanceof z.ZodError) {
      return c.json({ code: 500, message: error.errors }, 500);
    }

    return c.json({ code: 500, message: error.message || 'Internal server error' }, 500);
  }
});

export default endpoint;
