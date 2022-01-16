const fs = require('fs');
const ejs = require('ejs');
const path = require('path');

const createTemplate = (options) => {
	const root = path.join(process.cwd(), '/xxx');
	fs.mkdirSync(root);
	const useDefailt = Object.values(options).every((v) => v === false);
	const isJs = useDefailt || options.js;
	const renderSrcCode = [
		renderFile('createHtml.ejs', 'createHtml.html', {
			g: isJs
		}),
		renderFile('enterFile.ejs', `index.${isJs ? '.js' : '.ts'}`)
	];
	const renderRoot = [renderFile('lent.config.ejs', 'lent.config.js')];
	if (!isJs) {
		renderSrcCode.push(renderFile('index.d.ejs', 'index.d.ts'));
		renderRoot.push(renderFile('tsconfig.ejs', 'tsconfig.ts'));
	}
	renderRoot.forEach((v) => fs.writeFileSync(process.cwd(), v.source));
	renderSrcCode.forEach((v) =>
		fs.writeFileSync(path.join(root, v.fileName), v.source)
	);
	console.log('[lent cli] created template end');
};

const renderFile = (filePath, fileName, replace = {}) => {
	const sourece = fs
		.readFileSync(path.join(__dirname, `./code/${filePath}`))
		.toString();
	return {
		fileName: fileName,
		source: ejs.render(sourece, replace)
	};
};

exports.createTemplate = createTemplate;
