import http from 'http';
import { Lent } from '../index';
import { join } from 'path';
import { readFileSync } from 'fs';
import { sortUserPlugins } from '../../utils';

export const indexHtml = (lent: Lent) => {
	return async (
		req: http.IncomingMessage,
		res: http.ServerResponse,
		next: Function
	) => {
		if (req.url === '/') {
			const indexPath = join(lent.config.root, './index.html');

			const htmlPlugin = sortUserPlugins(lent.config.plugins).filter(
				(v) => v.transformIndexHtml
			);

			const htmlCode = await htmlPlugin.reduce((prev, next) => {
				return prev.then((code) => next.transformIndexHtml!(code));
			}, Promise.resolve(readFileSync(indexPath).toString()));

			return res.end(htmlCode);
		}
		next();
	};
};
