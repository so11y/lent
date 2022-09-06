import { LentPlugin } from './preCompose';
import magicString from 'magic-string';

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
				const ms = new magicString(v);
				ms.prepend(
					`import { createHotContext } from "/@lent/client";import.meta.hot = createHotContext('${file.requestUrl}');`
				);
				ms.prepend("var process = {env:{NODE_ENV:'development'}};");
				return ms.toString();
			}
			return v;
		}
	});
};
