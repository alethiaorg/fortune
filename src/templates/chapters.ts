import { createRoute, z } from '@hono/zod-openapi';
import { ChapterSchema } from '@/schemas';

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
					schema: z.array(ChapterSchema)
				}
			},
			description: 'Returns the chapters of the corresponding manga slug'
		},
		404: {
			description: 'Returns a 404 error when the manga in question is not found.'
		},
		500: {
			description: 'Returns a 500 error when an internal error occurs.'
		}
	}
});

export default route;
