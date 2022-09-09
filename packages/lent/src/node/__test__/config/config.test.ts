import { join } from 'path';
import { test, expect } from 'vitest';
import { resolveConfig } from '../../server/config';

test('test have config file', async () => {
	const config = await resolveConfig({
		configDir: join(__dirname, '../test-help')
	});
	expect(config).toMatchInlineSnapshot(`
		{
		  "port": 3099,
		  "root": "/",
		}
	`);
});

test('test less config file', async () => {
	const config = await resolveConfig({
		configDir: join(__dirname)
	});
	expect(config).toMatchInlineSnapshot(`
		{
		  "port": 3000,
		  "root": "/",
		}
	`);
});
