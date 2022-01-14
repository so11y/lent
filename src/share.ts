import Http from 'http';

export const isJsFlieRequest = (s: Http.IncomingMessage) => {
	return s.url.endsWith('.js');
};

export const handleUrl = (fileUrl: string) => {
	return fileUrl.split('?');
};

export const normFileStarwith = (fileName: string) => {
	if (fileName.startsWith('/')) {
		return `.${fileName}`;
	}
	return fileName;
};
