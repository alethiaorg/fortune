import customBuilder from '../helpers/custom-builder';

const endpoint = customBuilder({
	order: { latestUploadedChapter: 'desc' }
});

export default endpoint;
