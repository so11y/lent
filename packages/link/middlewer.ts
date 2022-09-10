interface ExpectFn<T extends Array<any>> {
	(...value: [...T, () => any]): void;
}
class ExpectLink<T extends Array<any>> {
	public expect!: ExpectFn<T>;
	public next!: ExpectLink<T>;
	running(...value: T) {
		const next = async () => {
			if (this.next) {
				await this.next.running(...(value as T));
			}
		};
		return this.expect(...[...(value as T), next]);
	}
}

export class ComposeLink<T extends Array<any>> {
	private prev!: ExpectLink<T>;
	private head!: ExpectLink<T>;
	public use(fn: ExpectFn<T>) {
		const link = new ExpectLink();
		link.expect = fn as any;
		if (!this.head) this.head = link;
		if (this.prev) this.prev.next = link;
		this.prev = link;
		return this;
	}
	public async run(...value: T) {
		return await this.head.running(...value);
	}
}
