import type { RollupOptions } from 'rollup';
import { MiddlewarePlugin } from '../node/server/middlewares/index';
import { Plugin } from './plugin';

export interface userConfig {
	configPath?: string;
	port?: number;
	root?: string;
	plugins?: Plugin[];
	middleware?: Array<MiddlewarePlugin>;
	build?: {
		rollupOptions?: RollupOptions;
	};
	extensions?: Array<string>;
}

export type LentConfig = Required<
	Pick<
		userConfig,
		'middleware' | 'root' | 'port' | 'build' | 'plugins' | 'extensions'
	>
>;
// & {
// 	userConfig: userConfig | null;
// };
