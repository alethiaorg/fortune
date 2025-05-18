import { OpenAPIHono, z } from '@hono/zod-openapi';
import { apiReference } from '@scalar/hono-api-reference';
import { serveStatic } from 'hono/cloudflare-workers';

import { HostSchema, SourceSchema } from './schemas';
import { host as route } from './templates';

import { default as BatotoSource } from '@/routes/batoto';
import { default as ComicKSource } from '@/routes/comick';
import { default as ExampleSource } from '@/routes/example';
import { default as MangaDexSource } from '@/routes/mangadex';
import { default as ManganatoSource } from '@/routes/manganato';
import { default as WeebCentralSource } from '@/routes/weebcentral';

type Source = z.infer<typeof SourceSchema>;
type APISource = Source & { handler: OpenAPIHono };

const sources: Array<APISource> = [
  {
    name: 'Example',
    icon: 'example.png',
    path: '/example',
    handler: ExampleSource,
    website: 'https://example.com',
    description: 'Example source for testing purposes'
  },
  {
    name: 'MangaDex',
    icon: 'mangadex.png',
    path: '/mangadex',
    handler: MangaDexSource,
    website: 'https://mangadex.org',
    description: 'Read manga online for free on MangaDex with no ads, high quality images and support scanlation groups!'
  },
  // Disabled

  // {
  //   name: 'Manganato',
  //   icon: 'manganato.png',
  //   path: '/manganato',
  //   handler: ManganatoSource
  // },
  {
    name: 'WeebCentral',
    icon: 'weebcentral.png',
    path: '/weebcentral',
    handler: WeebCentralSource,
    website: 'https://weebcentral.com',
    description: 'Explore Weeb Central for top manga titles, hidden gems, and the latest releases. Join our community of manga enthusiasts!'
  },
  {
    name: 'Bato.to',
    icon: 'batoto.png',
    path: '/batoto',
    handler: BatotoSource,
    website: 'https://bato.to',
    description: 'A manga reader for manga fans.'
  },
  {
    name: 'ComicK',
    icon: 'comick.png',
    path: '/comick',
    handler: ComicKSource,
    website: 'https://comick.io',
    description: 'Beautiful free reader and a Big database for comics (manhwa, manhua, manga).'
  }
];

const app = new OpenAPIHono();

app.get('/ping', (c) => c.text('healthy'));

app.get(
  '/static/*',
  serveStatic({
    root: './',
    manifest: ''
  })
);

app.openapi(route, (c) => {
  const items: Array<Source> = sources.map((item) => ({
    name: item.name,
    icon: item.icon,
    path: item.path,
    website: item.website,
    description: item.description
  }));

  const host = {
    name: 'Fortune',
    author: 'Alethia',
    website: 'https://github.com/alethiaorg/fortune',
    sources: items
  };

  try {
    HostSchema.parse(host);

    return c.json(host, 200);
  } catch (error) {
    console.log('Error: ', error);

    if (error instanceof z.ZodError) {
      return c.json({ code: 500, message: JSON.stringify(error.errors) }, 500);
    }

    return c.json({ code: 500, message: 'Internal server error' }, 500);
  }
});

app.get(
  '/docs',
  apiReference({
    theme: 'saturn',
    spec: { url: '/openapi' }
  })
);

app.doc('/openapi', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'API Specification'
  },
  servers: [
    {
      url: new URL('http://127.0.0.1:8787').origin,
      description: 'Local Environment'
    },
    {
      url: new URL('https://fortune.alethia.workers.dev').origin,
      description: 'Default Deployed Instance'
    },
    {
      url: new URL('https://fortune--staging.alethia.workers.dev').origin,
      description: 'Deployed Instance (Staging)'
    },
    {
      url: new URL('https://fortune--production.alethia.workers.dev').origin,
      description: 'Deployed Instance (Production)'
    }
  ]
});

sources.forEach((source) => {
  app.route(source.path, source.handler);
});

export default app;
