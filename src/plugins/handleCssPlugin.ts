import { LentPlugin } from './preCompose';

export const handleCssPlugin: LentPlugin = (l) => {
	l.plugin.addPlugins({
		exit: '.css',
		name: 'handleCssPlugin',
		transform: (v, fileName) => {
			return `
                const styles =  [...document.querySelectorAll("style")];
                const style = styles.find(v=>v.title === '${
									fileName.requestUrl
								}');
                if(style){
                    style.innerHTML = '${v.toString().replace(/\n|\r/g, '')}';
                }else{
                    const style = document.createElement('style');
                    style.setAttribute('type', 'text/css');
                    style.title = '${fileName.requestUrl}';
                    style.innerHTML = '${v.toString().replace(/\n|\r/g, '')}';
                    document.head.appendChild(style);
                }
                if (import.meta.hot) {
                    import.meta.hot.accept(() => {});
                }
                `;
		}
	});
};
