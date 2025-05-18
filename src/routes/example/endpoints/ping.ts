import { route } from '@/templates';
import { OpenAPIHono } from '@hono/zod-openapi';

const endpoint = new OpenAPIHono();

endpoint.openapi(route, async (c) => {
  return c.json('healthy', 200);
});

export default endpoint;
