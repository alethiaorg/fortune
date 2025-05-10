import { encodeUri } from '@/util';
import customBuilder from '../helpers/custom-builder';

const endpoint = customBuilder({
  order: { followedCount: 'desc' },
  createdAtSince: encodeUri(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 19))
});

export default endpoint;
