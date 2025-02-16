import customBuilder from '../helpers/custom-builder';

const endpoint = customBuilder({
	order: { followedCount: 'desc' }
});

export default endpoint;
