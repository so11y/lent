interface ExpectFn<T> {
	maybe(value: T): boolean;
	expect(value: T): void;
}
export enum Mode {
	If = 'IF',
	IfElse = 'IfElse'
}
class ExpectLink<T> {
	public expect!: ExpectFn<T>;
	public next!: ExpectLink<T> | null;
	private composeConfig: ComposeCondition<T>;
	constructor(config: ComposeCondition<T>) {
		this.composeConfig = config;
	}
	runTest(value: T) {
		const isMaybe = this.expect.maybe(value);
		if (isMaybe) {
			if (this.composeConfig.mode === Mode.If) {
				this.expect.expect(value);
			} else if (!this.composeConfig.isLock) {
				this.composeConfig.isLock = true;
				this.expect.expect(value);
			}
		}
		if (this.next && !this.composeConfig.isLock) {
			this.next.runTest(value);
		}
	}
}
export class ComposeCondition<T> {
	//前一个节点
	private prev!: ExpectLink<T>;
	//任务头节点
	private head!: ExpectLink<T>;
	//是否锁状态
	public isLock = false;
	//当前模式 "if"|"ifElse"
	public mode: Mode;
	constructor(mode: Mode = Mode.If) {
		this.mode = mode;
	}
	public use(fn: ExpectFn<T>) {
		const link = new ExpectLink(this);
		link.expect = fn;
		if (!this.head) this.head = link;
		if (this.prev) this.prev.next = link;
		this.prev = link;
		return this;
	}
	public run(value: T) {
		this.head.runTest(value);
	}
}
