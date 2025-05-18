import { OpenAPIHono, z } from '@hono/zod-openapi';
import axios from 'axios';
import { Cheerio, load } from 'cheerio';

import { chapterContents as route } from '@/templates';
import { decodeUri } from '@/util';
import { BASE_URL, USER_AGENT } from '../util/constants';

const endpoint = new OpenAPIHono();

endpoint.openapi(route, async (c) => {
  try {
    const { slug } = c.req.param();
    const url = `${BASE_URL}/title/${decodeUri(slug)}?load=2`;

    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': USER_AGENT
      }
    });

    const $ = load(html);

    // Find the astro-island element with opts containing the "ImageList"
    let imageListAstroIsland: Cheerio<any> = $();
    $('astro-island').each((i, el) => {
      const optsAttr = $(el).attr('opts');
      if (optsAttr) {
        const decodedOpts = optsAttr.replace(/&quot;/g, '"');
        const optsObj = JSON.parse(decodedOpts);

        if (optsObj.name === 'ImageList') {
          imageListAstroIsland = $(el);
          return false;
        }
      }
    });

    if (!imageListAstroIsland || imageListAstroIsland.length === 0) {
      throw new Error('No astro-island element with opts name "ImageList" found.');
    }

    let propsAttr = imageListAstroIsland.attr('props');
    if (!propsAttr) {
      throw new Error('No props attribute found on astro-island element.');
    }
    propsAttr = propsAttr.replace(/&quot;/g, '"');
    const props = JSON.parse(propsAttr);

    if (!props.imageFiles || !Array.isArray(props.imageFiles) || props.imageFiles.length < 2) {
      throw new Error('imageFiles property missing or malformed in props.');
    }

    const imageFilesString = props.imageFiles[1];
    const imageFiles = JSON.parse(imageFilesString);
    if (!Array.isArray(imageFiles)) {
      throw new Error('Parsed imageFiles is not an array.');
    }

    const contents: Array<string> = imageFiles.map((item: any) => {
      if (Array.isArray(item) && item.length >= 2) {
        return item[1].trim();
      } else {
        throw new Error(`Malformed image item: ${JSON.stringify(item)}`);
      }
    });

    z.array(z.string()).parse(contents);

    return c.json(contents, 200);
  } catch (error: any) {
    // Handle network errors
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return c.json({ code: 404, message: 'Network error' }, 404);
    }

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return c.json({ code: 500, message: error.errors }, 500);
    }

    // Generic error handling
    return c.json({ code: 500, message: error.message || 'Internal server error' }, 500);
  }
});

export default endpoint;
