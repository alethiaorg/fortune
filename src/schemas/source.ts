import { z } from '@hono/zod-openapi';

export const SourceSchema = z
	.object({
		name: z.string().openapi({
			description: 'Name of the source',
			example: 'MangaDex'
		}),

		icon: z.string().openapi({
			description: 'Path to the source icon (will need to build url via /public folder)',
			example: 'mangadex.png'
		}),

		path: z.string().openapi({
			description: 'Path to the source (with no slashes)',
			example: 'mangadex'
		})
	})
	.openapi('Source');
