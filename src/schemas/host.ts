import { z } from '@hono/zod-openapi';
import { SourceSchema } from './source';

export const HostSchema = z
	.object({
		name: z.string().openapi({
			description: 'Display name of the host',
			example: 'Fortune'
		}),

		sources: z.array(SourceSchema).openapi({
			description: 'Sources of the host',
			example: [
				{
					name: 'MangaDex',
					icon: 'mangadex.png',
					path: 'mangadex'
				}
			]
		})
	})
	.openapi('Host');
