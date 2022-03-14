import { LentPlugin } from './preCompose';
import rollup from 'rollup';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';

export const handleNodeModulePlugin: LentPlugin = (l) => {
	l.plugin.addPlugins({
		name: 'handleNodeModulePlugin',
		enforce: 'post',
		async transform(v, file) {
			if (!file.isLentModule) {
				const bundle = await rollup.rollup({
					input: file.filePath,
                    onwarn(){

                    },
					plugins: [
						commonjs(),
						replace({
							preventAssignment: true,
							values: {
								'process.env.NODE_ENV': "'development'"
							}
						})
					]
				});
				const source = await bundle.generate({
					format: 'esm'
				});
				// console.log(source);
				return source.output[0].code;
			}
			return v;
		}
	});
};
