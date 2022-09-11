import { defineConfig } from 'lent';

export default defineConfig({
	root: './src',
	resolve: {
		alias: {
			'@': './'
		}
	},
	define: {
		xxx: '"被替换xxx"'
	}
});
