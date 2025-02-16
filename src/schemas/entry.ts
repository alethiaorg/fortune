import { z } from '@hono/zod-openapi';

export const EntrySchema = z
	.object({
		slug: z.string().openapi({
			description:
				'slug used to when creating combined URL to the resource for fetching on the current API (not the remote resource)',
			example: 'manga-123456'
		}),

		title: z.string().openapi({
			description: 'The title of the manga.',
			example: 'Bakemonogatari'
		}),

		cover: z.string().openapi({
			description: 'The URL of the cover image.',
			example: 'https://example.com/cover/1.png'
		})
	})
	.openapi('Entry');

export const EntryParamsSchema = z
	.object({
		count: z
			.string()
			.optional()
			.openapi({
				description:
					'string value of number of items to be returned. ' +
					'A high value not supported by a source using these params will return its ' +
					'soft-limit instead of the defined limit in this object.',
				example: '60'
			}),

		page: z.string().optional().openapi({
			description:
				'string value of the current page which used with the count calculates the offset of what Entry objects to be returning',
			example: '0'
		})
	})
	.openapi('Entry Params');
