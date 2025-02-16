import { serveStatic } from 'hono/cloudflare-workers';
import { OpenAPIHono, z } from '@hono/zod-openapi';
import { apiReference } from '@scalar/hono-api-reference';

import { HostSchema, SourceSchema } from './schemas';
import { host as route } from './templates';

import { default as ExampleSource } from '@/routes/example';
import { default as MangaDexSource } from '@/routes/mangadex';
import { default as ManganatoSource } from '@/routes/manganato';

type Source = z.infer<typeof SourceSchema>;
type APISource = Source & { handler: OpenAPIHono };

const sources: Array<APISource> = [
	{
		name: 'Example',
		icon: 'example.png',
		path: '/example',
		handler: ExampleSource
	},
	{
		name: 'MangaDex',
		icon: 'mangadex.png',
		path: '/mangadex',
		handler: MangaDexSource
	},
	{
		name: 'Manganato',
		icon: 'manganato.png',
		path: '/manganato',
		handler: ManganatoSource
	}
];

const app = new OpenAPIHono();

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
		path: item.path
	}));

	const host = {
		name: 'Fortune',
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
			url: new URL('http://fortune.alethia.workers.dev').origin,
			description: 'Deployed Instance 1'
		},
		{
			url: new URL('http://fortune-2.alethia.workers.dev').origin,
			description: 'Deployed Instance (Alternative)'
		}
	]
});

sources.forEach((source) => {
	app.route(source.path, source.handler);
});

export default app;
