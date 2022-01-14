import fs from 'fs';
import path from 'path';
import { addFileChange } from '../watchFile';
import { createLentModuleDepend } from '../depends';
import { LentPlugin } from './preCompose';

export const indexRouterPlugin: LentPlugin = (l) => {
	l.router.addRouter({
		method: 'GET',
		path: '/',
		handler() {
			const indexPath = path.join(l.config.root, './index.html');
			l.depend.addDepend(
				indexPath,
				createLentModuleDepend({
					importFile: []
				})
			);
			addFileChange(
				l,
				{
					filePath: indexPath,
					requestUrl: indexPath
				},
				() => {
					l.socket.sendSocket({
						hotModule: {
							fileName: indexPath,
							parent: null
						},
						hot: true
					});
				}
			);
			return fs.readFileSync(indexPath);
		}
	});
};
