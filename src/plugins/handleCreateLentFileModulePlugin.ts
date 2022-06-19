import { createLentModuleDepend } from '../depends';
import { LentPlugin } from './preCompose';

export const handleCreateLentFileModulePlugin: LentPlugin = (l) => {
	l.plugin.addPlugins({
		name: 'handleCreateLentFileModulePlugin',
		enforce: 'pre',
		transform(v, file, i) {
			i.depend.addDepend(
				file.requestUrl,
				createLentModuleDepend({
					requestUrl: file.requestUrl,
					isLentModule: file.isLentModule
				})
			);
			return v;
		}
	});
};
