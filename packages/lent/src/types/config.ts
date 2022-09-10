import type { RollupOptions } from 'rollup';
import { Plugin } from './plugin';

export interface userConfig {
	configPath?: string;
	port?: number;
	root?: string;
	plugins?: Plugin[];
	build?: {
		rollupOptions?: RollupOptions;
	};
	extensions?: Array<string>;
}

export type LentConfig = Required<
	Pick<userConfig, 'root' | 'port' | 'build' | 'plugins' | 'extensions'>
>;
// & {
// 	userConfig: userConfig | null;
// };
