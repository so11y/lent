import { join } from 'path';
import { test, expect } from 'vitest';
import { resolveConfig } from '../../server/config';

const configPath = join(__dirname, '../test-help/lent.config.ts');
test('test have config file', async () => {
	const config = await resolveConfig({
		configPath
	});
	expect(config).toMatchInlineSnapshot(`
		{
		  "port": 3099,
		  "root": "/",
		  "userConfig": {
		    "port": 3099,
		  },
		}
	`);
});

test('test miss config file', async () => {
	const config = await resolveConfig({
		configPath: '/fake'
	});
	expect(config).toMatchInlineSnapshot(`
		{
		  "port": 3000,
		  "root": "/",
		  "userConfig": {
		    "configPath": "/fake",
		  },
		}
	`);
});

test('test inline config', async () => {
	const config = await resolveConfig({
		root: '/fake',
		port: 7999
	});
	expect(config).toMatchInlineSnapshot(`
		{
		  "port": 7999,
		  "root": "/fake",
		  "userConfig": {
		    "port": 7999,
		    "root": "/fake",
		  },
		}
	`);
});
