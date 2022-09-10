import { Plugin } from '../../../types/plugin';
import cheerio from 'cheerio';

export const htmlPlugin = (): Plugin => {
	return {
		name: 'lent:htmlPlugin',
		enforce: 'post',
		transformIndexHtml(html) {
			const select = cheerio.load(html);
			// select('head').append(`<script type='module' src='/@lent/client' />`);
			return select.html();
		}
	};
};
