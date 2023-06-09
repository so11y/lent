const fs = require('fs');
const ejs = require('ejs');
const path = require('path');

const createTemplate = () => {
	const root = path.join(process.cwd(), '/src');
	const renderSrc = [
		renderFile('createHtml.ejs', 'index.html'),
		renderFile('enterFile.ejs', 'index.ts')
	];
	const renderRoot = [
		renderFile('lent.config.ejs', 'lent.config.ts'),
		renderFile('tsconfig.ejs', 'tsconfig.json'),
		renderFile('package.ejs', 'package.json')
	];
	if (fs.existsSync(root)) {
		console.log('[lent cli] have src path remove to again');
	} else {
		fs.mkdirSync(root);
		renderSrc.forEach((v) =>
			fs.writeFileSync(path.join(root, v.fileName), v.source)
		);
		renderRoot.forEach((v) =>
			fs.writeFileSync(path.join(process.cwd(), v.fileName), v.source)
		);
		console.log('[lent cli] created template end');
	}
};

const renderFile = (filePath, fileName, replace = {}) => {
	const source = fs
		.readFileSync(path.join(__dirname, `./code/${filePath}`))
		.toString();
	return {
		fileName: fileName,
		source: ejs.render(source, replace)
	};
};

exports.createTemplate = createTemplate;
