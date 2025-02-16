/**
 * This template is specifically used for custom routes such as /recent, /popular, etc.
 * To use, simply wrap into openapi function, and define the endpoint in the parent.
 */

import { EntrySchema, ErrorSchema } from '@/schemas';
import { createRoute, RouteConfig, z } from '@hono/zod-openapi';

export const config: RouteConfig = {
	method: 'get',
	path: '/',
	request: {
		query: z.object({ count: z.string().optional(), page: z.string().optional() })
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: z.array(EntrySchema),
					example: [
						{
							slug: 'manga-1234',
							title: 'Entry 1234',
							cover: 'https://example.com/manga-1234/cover.png'
						},
						{
							slug: 'manga-2345',
							title: 'Entry 2345',
							cover: 'https://example.com/manga-2345/cover.png'
						},
						{
							slug: 'manga-3456',
							title: 'Entry 3456',
							cover: 'https://example.com/manga-3456/cover.png'
						}
					]
				}
			},
			description: `Returns the endpoint data`
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
};

export const route = createRoute(config);
