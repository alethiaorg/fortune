import { z } from '@hono/zod-openapi';

export const ChapterSchema = z
	.object({
		title: z.string().openapi({
			description: 'Title of the chapter',
			example: 'Hitagi Crab'
		}),

		slug: z.string().openapi({
			description: 'Slug for building fetch url',
			example: 'chapter-123456'
		}),

		number: z.number().openapi({
			description: 'Chapter number',
			example: 1
		}),

		scanlator: z.string().openapi({
			description: 'Scanlator of the chapter',
			example: '/a/nonymous'
		}),

		date: z.date().openapi({
			description: 'Date of the chapter in ISO format',
			example: '2021-01-01T00:00:00.000Z'
		})
	})
	.openapi('Chapter');
