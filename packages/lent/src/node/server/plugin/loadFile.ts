import { existsSync, readFileSync } from 'fs';
import { Plugin } from '../../../types/plugin';
import { cleanUrl } from '../../../node/utils';
import { Lent } from '../index';
import { build } from 'esbuild';

const buildModuleFile = async (lent: Lent, fileName: string) => {
	const result = await build({
		absWorkingDir: lent.config.root,
		entryPoints: [fileName],
		write: false,
		platform: 'node',
		bundle: true,
		format: 'esm',
		sourcemap: false,
		metafile: true,
		define: lent.config.define
	});
	const { text } = result.outputFiles[0];
	return text;
};

export const loadFilePlugin = (): Plugin => {
	let lent: Lent;
	return {
		name: 'lent:loadFile',
		enforce: 'post',
		configureServer(lentInstance) {
			lent = lentInstance;
		},
		async load(id: string) {
			const mod = lent.moduleGraph.getModulesByFile(id);
			if (mod?.isExternal) {
				return await buildModuleFile(lent, id);
			}
			if (id && existsSync(id)) {
				return readFileSync(cleanUrl(id)).toString();
			}
		}
	};
};
