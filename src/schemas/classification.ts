import { z } from '@hono/zod-openapi';

const classifications = ['Unknown', 'Safe', 'Suggestive', 'Explicit'] as const;

export const ClassificationSchema = z
	.preprocess((val) => {
		if (typeof val !== 'string') return 'Unknown';

		const normalizedVal = val.toLowerCase();

		const match = classifications.find(
			(classification) => classification.toLowerCase() === normalizedVal
		);

		return match ?? 'Unknown';
	}, z.enum(classifications))
	.openapi('Classification');
