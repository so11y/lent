import { htmlPlugin } from './html';
import { esbuildPlugin } from './esbuild';
import { resolvePlugin } from './resolve';
import { loadFilePlugin } from './loadFile';

export const resolvePlugins = () => {
	return [htmlPlugin(), esbuildPlugin(), resolvePlugin(), loadFilePlugin()];
};
