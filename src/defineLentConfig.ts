import { LentHttpInstance } from './types';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const defineLentConfig = <T extends Partial<LentHttpInstance['config']>>(
	l: T
): T => {
	return l;
};
