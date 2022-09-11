import { htmlPlugin } from './html';
import { esbuildPlugin } from './esbuild';
import { resolvePlugin } from './resolve';
import { loadFilePlugin } from './loadFile';
import { clientPlugin } from './handleClient';
import { importAnalysisPlugin } from './importAnalysis';

export const resolvePlugins = () => {
	return [
		clientPlugin(),
		htmlPlugin(),
		esbuildPlugin(),
		resolvePlugin(),
		loadFilePlugin(),
		importAnalysisPlugin()
	];
};
