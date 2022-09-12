interface ImportMeta {
	hot: {
		accept: (callback: (...arg: []) => unknown) => void;
	};
	glob(path: string): Array<Record<string, () => Promise<any>>>;
}
