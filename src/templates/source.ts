import { ErrorSchema, RouteSchema } from '@/schemas';
import { createRoute, z } from '@hono/zod-openapi';

const route = createRoute({
	method: 'get',
	path: '/',
	request: {
		// No request params needed
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: z.array(RouteSchema)
				}
			},
			description: 'Returns the available routes for this source.'
		},
		500: {
			content: {
				'application/json': {
					schema: ErrorSchema
				}
			},
			description: 'Internal server error'
		}
	}
});

export default route;
