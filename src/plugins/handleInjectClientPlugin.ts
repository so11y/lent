import { LentPlugin } from './preCompose';

export const handleInjectClientPlugin: LentPlugin = (l) => {
	l.plugin.addPlugins({
		name: 'handleFileImportPlugin',
		enforce: 'post',
		transform(v, file) {
			if (
				!file.isLentModule &&
				['.js', '.ts', '.tsx', '.mjs', '.mts', '.css'].some((v) =>
					file.filePath.endsWith(v)
				)
			) {
				return `
						import { createHotContext } from "/@lent/client";
						import.meta.hot = createHotContext('${file.requestUrl}');
						${v}
						`;
			}
			return v;
		}
	});
};
