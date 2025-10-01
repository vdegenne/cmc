export class CMCManager {
	#data: CMC.MiniCurrency[] = []
	#ready: Promise<void>

	constructor(
		protected baseUrl = 'https://cdn.jsdelivr.net/npm/@vdegenne/cmc/data/mini.json',
	) {
		this.#ready = this.loadRemote()
	}

	get ready(): Promise<void> {
		return this.#ready
	}

	async loadRemote(cache = false): Promise<void> {
		this.#ready = (async () => {
			const res = await fetch(this.baseUrl, {
				...(cache ? {cache: 'no-cache'} : {}),
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

	getCurrencyFromSymbol(
		symbol: string,
		fromLast = false,
	): CMC.MiniCurrency | undefined {
		if (!this.#data.length) return undefined
		const currencies = fromLast ? [...this.#data].reverse() : this.#data
		return currencies.find(
			(c) => c.symbol.toUpperCase() === symbol.toUpperCase(),
		)
	}

	getAll(): ReadonlyArray<CMC.MiniCurrency> {
		return this.#data
	}
}
