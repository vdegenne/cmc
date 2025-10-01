interface ManagerOptions {
	/**
	 * Data to use to hydrate the object when instanciated.
	 * Providing this will automatically turn prefetch to false.
	 *
	 * @default undefined
	 */
	initData: CMC.MiniCurrency[] | undefined

	/**
	 * whether to fetch data remotely automatically when object is created, or not.
	 *
	 * @default true
	 */
	prefetch: boolean

	/**
	 * Where to load the data from when using `loadRemote()`
	 *
	 * @default 'https://cdn.jsdelivr.net/npm/@vdegenne/cmc/data/mini.json'
	 */
	remoteUrl: string
}

export class CMCManager {
	#options: ManagerOptions
	#data: (CMC.Currency | CMC.MiniCurrency)[] | undefined = undefined
	#ready: Promise<void> | undefined

	constructor(options?: Partial<ManagerOptions>) {
		this.#options = {
			prefetch: true,
			initData: undefined,
			remoteUrl: 'https://cdn.jsdelivr.net/npm/@vdegenne/cmc/data/mini.json',
			...options,
		}

		if (this.#options.initData) {
			this.#data = this.#options.initData
		} else if (this.#options.prefetch) {
			this.loadRemote()
		}
	}

	async loadRemote(cache = false): Promise<void> {
		this.#ready = (async () => {
			const res = await fetch(this.#options.remoteUrl, {
				cache: cache ? 'force-cache' : 'no-cache',
			})
			if (!res.ok) {
				throw new Error(
					`Failed to fetch crypto data: ${res.status} ${res.statusText}`,
				)
			}
			this.#data = await res.json()
		})()
		return this.#ready
	}

	get ready(): Promise<void> {
		return this.#ready ?? Promise.resolve()
	}

	private ensureData(): void {
		if (this.#data === undefined || !this.#ready) {
			throw new Error(
				'Data not loaded. Call loadRemote() or await ready() first.',
			)
		}
	}

	getCurrencyFromSymbol(
		symbol: string,
		fromLast = false,
	): CMC.MiniCurrency | undefined {
		this.ensureData()
		const currencies = fromLast ? [...this.#data!].reverse() : this.#data!
		return currencies.find(
			(c) => c.symbol.toUpperCase() === symbol.toUpperCase(),
		)
	}

	getAll(): ReadonlyArray<CMC.MiniCurrency> {
		this.ensureData()
		return this.#data!
	}
}
