import { defineConfig } from 'lent';

export default defineConfig({
	root: './src',
	resolve: {
		alias: {
			'@': './'
		}
	},
	plugins: [
		{
			name: 'xixi',
			resolveId(id) {
				if (id == 'xixi') {
					return `/${id}`;
				}
			},
			load(id) {
				if (id == '/xixi') {
					return `export default "xixi-1010"`;
				}
			}
		}
	],
	define: {
		xxx: '"被替换xxx"'
	}
});
