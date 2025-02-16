import { z } from '@hono/zod-openapi';

import { ClassificationSchema } from './classification';
import { PublishStatusSchema } from './publish-status';

export const OriginSchema = z
	.object({
		slug: z.string().openapi({
			description: 'Slug for building fetch url',
			example: 'manga-123456'
		}),

		url: z.string().openapi({
			description: 'URL to the source resource',
			example: 'https://example.com/manga/manga-123456'
		}),

		referer: z.string().openapi({
			description: 'Optional custom referer header for use in fetch request',
			example: 'https://example.com'
		}),

		covers: z.array(z.string()).openapi({
			description: 'Covers of the manga',
			example: ['https://example.com/manga/manga-123456/cover.jpg']
		}),

		status: PublishStatusSchema.openapi({
			description: 'Publish status of the manga (Defaults to Unknown)',
			example: 'Ongoing'
		}),

		classification: ClassificationSchema.openapi({
			description: 'Classification of the manga (Defaults to Unknown)',
			example: 'Safe'
		}),

		creation: z.date().openapi({
			description: 'Creation date of the manga in ISO format',
			example: '2021-01-01T00:00:00.000Z'
		})
	})
	.openapi('Origin');
