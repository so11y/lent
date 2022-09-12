import { Alias } from '@rollup/plugin-alias';
import type { RollupOptions } from 'rollup';
import { MiddlewarePlugin } from '../node/server/middlewares/index';
import { Plugin } from './plugin';

export interface userConfig {
	configPath?: string;
	port?: number;
	root?: string;
	plugins?: Plugin[];
	middleware?: Array<MiddlewarePlugin>;
	define?: Record<string, string>;
	build?: {
		rollupOptions?: RollupOptions;
	};
	extensions?: Array<string>;
	resolve?: {
		alias?: readonly Alias[] | { [find: string]: string };
	};
}

export type LentConfig = Required<
	Pick<
		userConfig,
		| 'plugins'
		| 'resolve'
		| 'middleware'
		| 'root'
		| 'port'
		| 'build'
		| 'plugins'
		| 'extensions'
		| 'define'
	>
>;
// & {
// 	userConfig: userConfig | null;
// };
