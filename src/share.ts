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

export const sliceFileDotName = (str: string) => {
	if (str && str.startsWith('./')) {
		return str.slice(1);
	}
	return str;
};

export const importFileHash = (importStr: string, hash: string) => {
	const importStrsuffix = importStr.slice(importStr.length - 1);
	const fileSliceAfter = importStr.slice(0, importStr.length - 1);
	const isAddSymbol = importStrsuffix === "'" ? "'" : '"';
	return `${fileSliceAfter}?t=${hash}${isAddSymbol}`;
};

export const isLentRequest = (str: string) => {
	if (str.startsWith('/@lent')) {
		return str.replace('/@lent', '');
	}
	return str;
};

export const getLastFileName = (fileName: string) => {
	const lastFileIndex = fileName.lastIndexOf('/');
	const lastFileName = fileName.slice(lastFileIndex);
	const startPath = fileName.slice(0, lastFileIndex);
	return [startPath, lastFileName];
};
