import { createRoute, z } from '@hono/zod-openapi';

import { config } from './route';
import { EntryParamsSchema } from '@/schemas/entry';

const searchSchema = EntryParamsSchema.merge(
	z.object({
		query: z.string().openapi({
			description: 'Query string value to search',
			example: 'bakemono'
		})
	})
);

const searchConfig = {
	...config,
	request: {
		query: searchSchema
	}
};

const route = createRoute(searchConfig);

export default route;
