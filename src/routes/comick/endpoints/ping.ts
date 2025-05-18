import { route } from '@/templates';
import { OpenAPIHono, z } from '@hono/zod-openapi';
import axios from 'axios';
import { BASE_URL, USER_AGENT } from '../util/constants';

const endpoint = new OpenAPIHono();

endpoint.openapi(route, async (c) => {
  try {
    const res = await axios.get(`${BASE_URL}`, {
      headers: {
        'User-Agent': USER_AGENT
      },
      validateStatus: () => true
    });

    // Status 404 typically fine as base endpoint is not a valid endpoint anyway
    if (res.status === 200 || res.status === 404) {
      return c.json('healthy', 200);
    }

    throw new Error(`Unexpected status code from base URL: ${res.status}`);
  } catch (error: any) {
    console.error('Error occurred:', error);

    if (error instanceof z.ZodError) {
      return c.json({ code: 500, message: error.errors }, 500);
    }

    return c.json({ code: 500, message: error.message || 'Internal server error' }, 500);
  }
});

export default endpoint;
