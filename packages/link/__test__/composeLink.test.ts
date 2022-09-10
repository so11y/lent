import { ComposeLink } from '@lent/link';
import {  test, expect } from 'vitest';

test('composeLink.test', () => {
  expect.assertions(2);
  const link = new ComposeLink<[string, string]>('1', '2');
	return new Promise<void>((resolve) => {
		link
			.use((value1, value2, next) => {
        expect([value1,value2]).toEqual(["1","2"])
				next();
			})
			.use((value1,value2, next) => {
        expect([value1,value2]).toEqual(["1","2"])
        next();
			})
			.run().then(resolve)
	});
});

test('composeLink.test1', () => {
  expect.assertions(2);
  let count =0 ;
  const link = new ComposeLink<[string, string]>('1', '2');
	return new Promise<void>((resolve) => {
		link
			.use((value1, value2, next) => {
				next();
        count++;
        expect(count).toBe(2)
			})
			.use((value1,value2, next) => {
        count++;
        expect(count).toBe(1)
        next();
			})
			.run().then(resolve)
	});
});