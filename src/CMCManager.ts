type UrlBuilderFunction = (
	getLastVersion: () => Promise<string>,
) => Promise<string>

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
	 * By default it creates the url using the follow UrlBuilderFunction
	 * ```ts
	 * async function (getLastVersion) {
	 *   return `https://cdn.jsdelivr.net/npm/@vdegenne/cmc@${await getLastVersion()}/mini.json`;
	 * }
	 * ```
	 *
	 * You can also use your own function:
	 * ```ts
	 * new CMCManager({
	 *   async remoteUrl(getLastVersion) { return `https://unpkg.com/@vdegenne/cmc@${await getLastVersion()}/data/all.json` }
	 * })
	 * ```
	 *
	 * Or just a simple string:
	 * ```ts
	 * new CMCManager({
	 *   remoteUrl: 'https://unpkg.com/@vdegenne/cmc@0.1.17/mini.json'
	 * })
	 * ```
	 */
	remoteUrl: string | UrlBuilderFunction

	/**
	 * Trying to encourage cache if possible when using `loadRemote()`
	 * That doesn't prevent the endpoint to provide updated data when it changes.
	 *
	 * @default undefined
	 */
	fetchCacheStrategy:
		| 'default'
		| 'no-cache'
		| 'force-cache'
		| 'no-store'
		| 'only-if-cached'
		| 'reload'
		| undefined

	debug: boolean
}

async function getLastVersion() {
	const res = await fetch('https://registry.npmjs.org/@vdegenne/cmc/latest')
	const data = await res.json()
	return data.version as string
}

export class CMCManager {
	#options: ManagerOptions
	#data: (CMC.Currency | CMC.MiniCurrency)[] | undefined = undefined
	#ready: Promise<void> | undefined

	#log(...message: any[]) {
		if (this.#options.debug) {
			console.log(...message)
		}
	}

	constructor(options?: Partial<ManagerOptions>) {
		this.#options = {
			prefetch: true,
			initData: undefined,
			async remoteUrl(getLastVersion) {
				return `https://cdn.jsdelivr.net/npm/@vdegenne/cmc@${await getLastVersion()}/mini.json`
			},
			fetchCacheStrategy: undefined,
			debug: false,
			...options,
		}

		if (this.#options.initData) {
			this.#log('Data initialized')
			this.#data = this.#options.initData
		} else if (this.#options.prefetch) {
			this.#log('Prefetching')
			this.loadRemote()
		}

		this.#log('Constructor end.')
	}

	async loadRemote(
		cacheStrategy = this.#options.fetchCacheStrategy,
	): Promise<void> {
		this.#ready = (async () => {
			this.#log('Fetching remote data...')
			let url: string
			switch (typeof this.#options.remoteUrl) {
				case 'string':
					url = this.#options.remoteUrl
					break
				case 'function':
					url = await this.#options.remoteUrl(getLastVersion)
					break
				default:
					// exhaustive check: if we ever get here, TS will error
					const _exhaustive: never = this.#options.remoteUrl
					throw new Error(`Unsupported type: ${_exhaustive}`)
			}
			const res = await fetch(url, {
				...(cacheStrategy !== undefined ? {cache: cacheStrategy} : {}),
			})
			if (!res.ok) {
				throw new Error(
					`Failed to fetch crypto data: ${res.status} ${res.statusText}`,
				)
			}
			this.#log('Fetch success.')
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
		const currency = currencies.find(
			(c) => c.symbol.toUpperCase() === symbol.toUpperCase(),
		)
		this.#log('getCurrencyFromSymbol found: ', currency)
		return currency
	}

	getAll(): ReadonlyArray<CMC.MiniCurrency> {
		this.ensureData()
		return this.#data!
	}
}
