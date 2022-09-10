import type { RollupOptions } from 'rollup';

export interface userConfig {
	configPath?: string;
	port?: number;
	root?: string;
	plugins?:any[];
	build?: {
		rollupOptions?: RollupOptions;
	};
}

export type LentConfig = Required<
	Pick<userConfig, 'root' | 'port' | 'build'|'plugins'>
> & {
	userConfig: userConfig | null;
};

