import { OpenAPIHono, z } from '@hono/zod-openapi';

import { APIRoute } from '@/types';
import { RouteSchema } from '@/schemas';
import { source as route } from '@/templates';

import { default as search } from './endpoints/get-search';
import { default as manga } from './endpoints/get-manga';
import { default as chapters } from './endpoints/get-chapters';
import { default as chapter } from './endpoints/get-chapter-content';

import { default as top } from './endpoints/get-top';
import { default as popular } from './endpoints/get-popular';
import { default as rising } from './endpoints/get-rising';
import { default as recent } from './endpoints/get-recent';
import { default as recentlyAdded } from './endpoints/get-new';

const source = new OpenAPIHono();

const routes: Array<APIRoute> = [
	{
		name: 'Top Rated',
		path: '/top',
		handler: top
	},
	{
		name: 'Most Popular',
		path: '/popular',
		handler: popular
	},
	{
		name: 'Rising',
		path: '/rising',
		handler: rising
	},
	{
		name: 'Recently Updated',
		path: '/recent',
		handler: recent
	},
	{
		name: 'Recently Added',
		path: '/new',
		handler: recentlyAdded
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

source.route('/search', search);
source.route('/manga', manga);
source.route('/chapters', chapters);
source.route('/chapter', chapter);

// Custom
routes.forEach((route) => {
	source.route(route.path, route.handler);
});

export default source;
