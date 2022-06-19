import Http from 'http';

export const isJsFlieRequest = (s: Http.IncomingMessage) => {
	return s.url.endsWith('.js');
};

export const handleUrl = (fileUrl: string) => {
	return fileUrl.split('?');
};

export const normFileStartWith = (fileName: string) => {
	if (fileName.startsWith('/')) {
		return `.${fileName}`;
	}
	return fileName;
};

export const sliceFileDotName = (str: string) => {
	if (str && str.startsWith('./')) {
		return str.slice(1);
	}
	return str;
};

export const isLentRequest = (str: string): [string, boolean] => {
	if (str.startsWith('/@lent/')) {
		return [str.replace('/@lent/', ''), true];
	}
	return [str, false];
};

export const getLastFileName = (fileName: string) => {
	const lastFileIndex = fileName.lastIndexOf('/');
	const lastFileName = fileName.slice(lastFileIndex);
	const startPath = fileName.slice(0, lastFileIndex);
	return [startPath, lastFileName];
};

export const isNodeModuleFile = (fileName: string) => {
	if (
		fileName &&
		['/', './', '../', '.'].every((v) => !fileName.startsWith(v))
	) {
		return true;
	}
	return false;
};
