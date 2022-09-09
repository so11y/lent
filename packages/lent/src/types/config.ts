export interface userConfig {
	configPath?: string;
	port?: number;
	root?: string;
}

export type LentConfig = Required<Pick<userConfig, 'root' | 'port'>> & {
	userConfig: userConfig | null;
};
