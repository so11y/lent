import { LentConfig, userConfig } from '../../types/config';
import { resolveConfig } from './config';

class Lent {
	config!: LentConfig;
	async init(inlineConfig?: userConfig) {
		this.config = await resolveConfig(inlineConfig);
	}
}

export const lent = () => {
	// new lent();
};
