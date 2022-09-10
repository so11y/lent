import { htmlPlugin } from './html';
import { esbuildPlugin } from './esbuild';

export const resolvePlugins = () => {
	return [htmlPlugin(), esbuildPlugin()];
};
