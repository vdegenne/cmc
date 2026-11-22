type UrlBuilderFunction = (
	getLastVersion: () => Promise<string>,
) => Promise<string>

interface ManagerOptions {
	/**
	 * Data to use to hydrate the object when instantiated.
	 * Providing this will automatically turn prefetch to false.
	 *
	 * @default undefined
	 */
	initData: CMC.MiniCurrency[] | undefined

	/**
	 * Whether to fetch data remotely automatically when object is created.
	 *
	 * @default true
	 */
	prefetch: boolean

	/**
	 * Where to load the data from when using loadRemote().
	 */
	remoteUrl: string | UrlBuilderFunction

	/**
	 * Trying to encourage cache if possible when using loadRemote().
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

async function getLastVersion(): Promise<string> {
	const res = await fetch('https://registry.npmjs.org/@vdegenne/cmc/latest')

	if (!res.ok) {
		throw new Error(
			`Failed to fetch latest version: ${res.status} ${res.statusText}`,
		)
	}

	const data = await res.json()
	return data.version as string
}

export class CMCManager {
	#options: ManagerOptions
	#data: (CMC.Currency | CMC.MiniCurrency)[] | undefined
	#ready: Promise<void> | undefined

	/**
	 * @deprecated
	 */
	#log(...message: any[]): void {
		if (this.#options.debug) console.log(...message)
	}

	constructor(options?: Partial<ManagerOptions>) {
		this.#options = {
			prefetch: true,
			initData: undefined,
			remoteUrl: async (getLastVersion) =>
				`https://cdn.jsdelivr.net/npm/@vdegenne/cmc@${await getLastVersion()}/data/mini.json`,
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

			const remoteUrl = this.#options.remoteUrl
			const url =
				typeof remoteUrl === 'string'
					? remoteUrl
					: await remoteUrl(getLastVersion)

			const res = await fetch(url, {
				...(cacheStrategy !== undefined && {cache: cacheStrategy}),
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

		const normalizedSymbol = symbol.toUpperCase()
		const data = this.#data!

		const currency = fromLast
			? data.findLast((c) => c.symbol.toUpperCase() === normalizedSymbol)
			: data.find((c) => c.symbol.toUpperCase() === normalizedSymbol)

		// this.#log('getCurrencyFromSymbol found: ', currency)
		return currency
	}

	getAll(): ReadonlyArray<CMC.MiniCurrency> {
		this.ensureData()
		return this.#data!
	}
}
