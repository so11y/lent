import { createLentModuleDepend } from '../depends';
import { LentPlugin } from './preCompose';

export const handleCreateLentFileModule: LentPlugin = (l) => {
	l.plugin.addPlugins({
		name: 'handleCreateLentFileModule',
		enforce: 'post',
		transform(v, file, i) {
			i.depend.addDepend(
				file.requestUrl,
				createLentModuleDepend({
					requestUrl: file.requestUrl,
					isNotLentModule: file.isLentModule
				})
			);
			return v;
		}
	});
};
