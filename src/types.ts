import { OpenAPIHono } from '@hono/zod-openapi';

export type APIRoute = { name: string; path: string; handler: OpenAPIHono };

export type APISource = {
	name: string;
	icon: string;
	path: string;
};
