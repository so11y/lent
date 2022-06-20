import { LentPlugin } from './preCompose';

export const handleEnvPlugin: LentPlugin = (l) => {
	l.plugin.addPlugins({
		name: 'handleEnvPlugin',
		enforce: 'post',
		transform(v, file) {
			if (
				['.js', '.ts', '.tsx', '.mjs', '.mts'].some((v) =>
					file.filePath.endsWith(v)
				)
			) {
				return `
                var process = {
                    env:{
                        NODE_ENV:'development'
                    }
                }
                ${v}
                `;
			}
			return v;
		}
	});
};
