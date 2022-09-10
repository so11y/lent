import { htmlPlugin } from './html';
import { esbuildPlugin } from './esbuild';
import { resolvePlugin } from './resolve';
import { loadFilePlugin } from './loadFile';
import { clientPlugin } from './handleClient';

export const resolvePlugins = () => {
	return [clientPlugin(),htmlPlugin(), esbuildPlugin(), resolvePlugin(), loadFilePlugin()];
};
