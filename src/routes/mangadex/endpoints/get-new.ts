import customBuilder from '../helpers/custom-builder';

const endpoint = customBuilder({
	order: { createdAt: 'desc' }
});

export default endpoint;
