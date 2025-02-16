import customBuilder from '../helpers/custom-builder';

const endpoint = customBuilder({
	order: { rating: 'desc' }
});

export default endpoint;
