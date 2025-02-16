import { createRoute, z } from '@hono/zod-openapi';

import { HostSchema, ErrorSchema } from '@/schemas';

const route = createRoute({
	method: 'get',
	path: '/',
	request: {},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: HostSchema
				}
			},
			description:
				'Returns full manga details including its main metadata, chapters and origin metadata.'
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
