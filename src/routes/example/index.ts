import { OpenAPIHono, z } from '@hono/zod-openapi';

import { RouteSchema } from '@/schemas';
import { source as route } from '@/templates';
import { APIRoute } from '@/types';

import { default as chapter } from './endpoints/get-chapter-contents';
import { default as chapters } from './endpoints/get-chapters';
import { default as manga } from './endpoints/get-manga';
import { default as ping } from './endpoints/ping';

import { default as custom } from './endpoints/get-custom';

const source = new OpenAPIHono();

const routes: Array<APIRoute> = [
  {
    name: 'Custom',
    path: '/custom',
    handler: custom
  }
];

source.openapi(route, (c) => {
  const items = routes.map((item) => ({
    name: item.name,
    path: item.path
  }));

  try {
    z.array(RouteSchema).parse(items);

    return c.json(items, 200);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ code: 500, message: JSON.stringify(error.errors) }, 500);
    }

    return c.json({ code: 500, message: 'Internal server error' }, 500);
  }
});

source.route('/ping', ping);
source.route('/manga', manga);
source.route('/chapters', chapters);
source.route('/chapter', chapter);

routes.forEach((route) => {
  source.route(route.path, route.handler);
});

export default source;
