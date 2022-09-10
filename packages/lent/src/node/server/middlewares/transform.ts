import http from 'http';
import { Lent } from '../index';
import { join, resolve } from 'path';
import { readFileSync } from 'fs';
import { sortUserPlugins, cleanInternalUrl } from '../../utils';
import { getPackageInfo } from 'local-pkg';

const whites = ['client'];
const handleInternal = (url: string): [string, boolean] => {
	const url_ = cleanInternalUrl(url);
	if (url.startsWith('/@lent/') && whites.includes(url_)) {
		const filePath = resolve(resolve('lent'), `./dist/${url}.js`);
		return [filePath, true];
	}
	return [url, false];
};

export const doTransform = (lent: Lent) => {
	return async (
		req: http.IncomingMessage,
		res: http.ServerResponse,
		next: Function
	) => {
		const [url, isInternal] = handleInternal(req.url!);
		let path = url;
		if (!isInternal) {

		}
	};
};
