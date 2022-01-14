import { LentPlugin } from './preCompose';

export const handleInjectClientPlugin: LentPlugin = (l) => {
	l.plugin.addPlugins({
		name: 'handleFileImportPlugin',
		exits: ['.js', '.ts', '.css'],
		transform(v, file, i) {
			if (file.requestUrl.includes('client')) return v;
			return `import { createHotContext } from "./client";
            import.meta.hot = createHotContext('${file.requestUrl}');
            ${v};
           `;
		}
	});
};
