export interface userConfig {
	configDir?: string;
	port?: number;
	root?: string;
}

export type LentConfig = Required<Pick<userConfig, 'root' | 'port'>>;
