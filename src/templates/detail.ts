import { createRoute, z } from '@hono/zod-openapi';

import { DetailSchema, ErrorSchema } from '@/schemas';

const route = createRoute({
	method: 'get',
	path: '/{slug}',
	request: {
		params: z.object({ slug: z.string() })
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: DetailSchema
				}
			},
			description:
				'Returns full manga details including its main metadata, chapters and origin metadata.'
		},
		404: {
			content: {
				'application/json': {
					schema: ErrorSchema
				}
			},
			description: 'Returns a 404 error when the manga is not found.'
		},
		500: {
			content: {
				'application/json': {
					schema: ErrorSchema
				}
			},
			description: 'Returns a 500 error when an internal error like parsing/decoding occurs.'
		}
	}
});

export default route;
