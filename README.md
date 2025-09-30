Create static data from CoinMarketCap :

- `./data/all.json`: over +33k coins. Example of one coin:

```json
{
	"id": 1,
	"name": "bitcoin",
	"symbol": "btc",
	"slug": "bitcoin",
	"is_active": 1,
	"status": "active",
	"rank": 1
}
```

- `./data/mini.json`: over +33k coins. Only contains `id`, `name`, `slug`, `symbol`

## How to use data

```ts
/* cmc.ts */
import _currencies from '@vdegenne/cmc/data/mini.json' with {type: 'json'}
export * from '@vdegenne/cmc'

export const currencies = _currencies as CMC.MiniCurrency[]

export function getCMCCurrencyFromSymbol(symbol: string, fromLast = false) {
	const currencies = [..._currencies] as CMC.MiniCurrency[]
	if (fromLast) {
		currencies.reverse()
	}
	symbol = symbol.toLocaleUpperCase()
	return currencies.find((c) => c.symbol === symbol)
}
```

Do not forget to add `@vdegenne/cmc` to the list of `types` in your `tsconfig.json`.
