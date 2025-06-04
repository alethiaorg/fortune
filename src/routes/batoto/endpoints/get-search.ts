import axios from 'axios';
import { load } from 'cheerio';

import { OpenAPIHono, z } from '@hono/zod-openapi';

import { EntrySchema } from '@/schemas';
import { route } from '@/templates';
import { encodeUri } from '@/util';

import { BASE_URL, USER_AGENT } from '../util/constants';

type Entry = z.infer<typeof EntrySchema>;

const endpoint = new OpenAPIHono();

endpoint.openapi(route, async (c) => {
  let { query, page } = c.req.query();

  page = page && page !== 'null' ? page : '1';

  try {
    const _page = Number.parseInt(page);
    const searchTerm = query.trim().replace(' ', '%20');

    const url = `${BASE_URL}/v3x-search?word=${searchTerm}&page=${_page}`;

    const { data: html } = await axios.get(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    const $ = load(html);

    const results: Array<Entry> = [];

    $('div.grid.grid-cols-1.gap-5.border-t.border-t-base-200.pt-5').each((_, gridEl) => {
      $(gridEl)
        .find('div.flex.border-b.border-b-base-200.pb-5')
        .each((_, entryEl) => {
          const link = $(entryEl).find('div.shrink-0.relative.group a').first();

          if (!link.length) {
            return;
          }

          const href = link.attr('href');

          if (!href) {
            return;
          }

          const fullSlug = href.replace('/title/', '');
          const slug = fullSlug.split('-')[0];

          const cover = link.find('img').first().attr('src') || '';

          const rawTitle = link.find('img').first().attr('title') || '';

          const title = rawTitle
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          results.push({ slug: encodeUri(slug), cover, title });
        });
    });

    z.array(EntrySchema).parse(results);

    return c.json(results, 200);
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return c.json({ code: 404, message: 'Manga not found' }, 404);
    }

    console.error('Error occurred:', error);

    if (error instanceof z.ZodError) {
      return c.json({ code: 500, message: error.errors }, 500);
    }

    return c.json({ code: 500, message: error.message || 'Internal server error' }, 500);
  }
});

export default endpoint;
