import fs from 'fs'
import path from 'path'

const DATA_DIR = path.resolve(import.meta.dirname, '..', '..', 'data')
const LIMIT = 10000
const ALL_FILE = path.join(DATA_DIR, 'all.json')
const MINI_FILE = path.join(DATA_DIR, 'mini.json')

async function fetchAllCurrencies(): Promise<CMC.Currency[]> {
	let start = 1
	const allCurrencies = []

	while (true) {
		const url = `https://api.coinmarketcap.com/data-api/v3/map/all?listing_status=active,untracked&exchangeAux=is_active,status&cryptoAux=is_active,status&start=${start}&limit=${LIMIT}`
		console.log(`Fetching currencies from ${start} to ${start + LIMIT - 1}...`)

		const res = await fetch(url)
		if (!res.ok)
			throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`)

		const json = (await res.json()) as CMC.MapAllResponse
		const currencies = json.data.cryptoCurrencyMap

		if (!currencies || currencies.length === 0) break

		allCurrencies.push(...currencies)
		start += LIMIT
	}

	return allCurrencies
}

async function main() {
	try {
		if (!fs.existsSync(DATA_DIR)) {
			fs.mkdirSync(DATA_DIR, {recursive: true})
		}

		let allCurrencies = await fetchAllCurrencies()
		// allCurrencies = allCurrencies.filter(
		// 	(c) => c.symbol.toLocaleLowerCase() !== 'eden',
		// )

		// Save full data
		fs.writeFileSync(ALL_FILE, JSON.stringify(allCurrencies), 'utf-8')
		console.log(`Saved ${allCurrencies.length} currencies to ${ALL_FILE}`)

		// Save mini version
		const mini = allCurrencies.map((c) => ({
			id: c.id,
			slug: c.slug,
			symbol: c.symbol,
			name: c.name,
		}))
		fs.writeFileSync(MINI_FILE, JSON.stringify(mini), 'utf-8')
		console.log(`Saved mini data to ${MINI_FILE}`)
	} catch (err) {
		console.error('Error fetching currencies:', err)
	}
}

main()
