import path from 'path';
import { glob } from 'glob';
import { LentPlugin } from './preCompose';
import MagicString from 'magic-string';

export const handleGoldPlugin: LentPlugin = (l) => {
	l.plugin.addPlugins({
		name: 'handleGoldPlugin',
		exits: ['.js', '.ts', '.tsx', '.mjs', '.mts'],
		transform(v, file, i) {
			if (v) {
				const globIndex = v.indexOf('import.meta.glob(');
				if (globIndex > -1) {
					const endIndex = v.indexOf(`)`, globIndex);
					const globStart = globIndex + 'import.meta.glob('.length + 1;
					const pattern = v.slice(globStart, endIndex - 1);
					const files = glob.sync(pattern, {
						cwd: path.join(process.cwd(), i.config.root),
						ignore: ['**/node_modules/**']
					});
					const overwriteCode = new MagicString('');
					overwriteCode.prepend('{');
					files.forEach((v) => {
						overwriteCode.append(`'${v}':()=>import('${v}'),`);
					});
					overwriteCode.append('}');
					const s = new MagicString(v);
					s.overwrite(globIndex, endIndex + 1, overwriteCode.toString());
					return s.toString();
				}
			}
			return v;
		}
	});
};
