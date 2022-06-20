// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MiddlewareNext<T = any> = ExpectLink<T>['running'];

interface ExpectFn<T> {
	(value: T, next: MiddlewareNext<T>);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class ExpectLink<T = any> {
	public expect: ExpectFn<T>;
	public next: ExpectLink<T> | null;
	running(value?) {
		const next = async () => {
			if (this.next) {
				await this.next.running(value);
			}
		};
		return this.expect(value, next);
	}
}

export class ComposeLink<T> {
	private prev: ExpectLink<T> = null;
	private head: ExpectLink<T> = null;
	private value: T;
	constructor(value?: T) {
		this.value = value;
	}
	public use(fn: ExpectFn<T>) {
		const link = new ExpectLink();
		link.expect = fn;
		if (!this.head) this.head = link;
		if (this.prev) this.prev.next = link;
		this.prev = link;
		return this;
	}
	public run(value?: T) {
		if (value) {
			this.value = value;
		}
		//执行头节点的入口函数
		return this.head.running(this.value);
	}
}
