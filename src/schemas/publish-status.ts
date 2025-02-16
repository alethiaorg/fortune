import { z } from '@hono/zod-openapi';

const statuses = ['Unknown', 'Ongoing', 'Completed', 'Cancelled', 'Hiatus'] as const;

export const PublishStatusSchema = z
	.preprocess((val) => {
		if (typeof val !== 'string') return 'Unknown';

		const normalizedVal = val.toLowerCase();

		const match = statuses.find((status) => status.toLowerCase() === normalizedVal);

		return match ?? 'Unknown';
	}, z.enum(statuses))
	.openapi('PublishStatus');
