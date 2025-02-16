import { z } from '@hono/zod-openapi';

export const RouteSchema = z
	.object({
		name: z.string().openapi({
			description: 'Display name of the route',
			example: 'Example Source'
		}),

		path: z.string().openapi({
			description: 'Path to the route (with no slashes)',
			example: 'example'
		})
	})
	.openapi('Route');
