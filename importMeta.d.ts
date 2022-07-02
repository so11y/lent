interface ImportMeta {
	hot: {
		accept: (callback: (...arg: []) => unknown) => void;
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	glob(path: string): Array<Record<string, () => Promise<any>>>;
}
