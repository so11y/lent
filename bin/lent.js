#!/usr/bin/env node
const crateLent = require('../dist/index.js');
const { Command } = require('commander');
const { createTemplate } = require('../cli/template/index');

const program = new Command();

program.version(`lent version ${require('../package.json').version}`);

program
	.command('template')
	.option('--js', 'created javaScript template to cwd', false)
	.option('--ts', 'created typeScript template to cwd', false)
	.option('--leetcode', 'created typeScript template to cwd', false)
	.description('[lent cli] create template')
	.action(createTemplate);

program.argument('[]').action((_, options, command) => {
	if (command.args.length === 0) {
		crateLent.lent().http.start();
	}
});

program.parse(process.argv);
