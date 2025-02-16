import { createRoute, z } from '@hono/zod-openapi';

const route = createRoute({
	method: 'get',
	path: '/{slug}',
	request: {
		params: z.object({ slug: z.string() }),
		query: z.object({ quality: z.enum(['data', 'data-saver']).optional() })
	},
	responses: {
		200: {
			content: {
				'application/json': {
					// Just an array of strings
					schema: {
						type: 'array',
						items: { type: 'string' },
						example: [
							'https://example.com/image1.jpg',
							'https://example.com/image2.jpg',
							'https://example.com/image3.jpg'
						]
					}
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
