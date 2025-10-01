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

Do not forget to add `@vdegenne/cmc` to the list of `types` in your `tsconfig.json` to have the types available.

### Static version

```ts
/* cmc.ts */
import currencies from '@vdegenne/cmc/data/mini.json' with {type: 'json'}
import {CMCManager} from '@vdegenne/cmc/CMCManager.js'
export * from '@vdegenne/cmc/utils.js'

export const cmcManager = new CMCManager({
	initData: currencies,
})

// Usage
cmcManager.getCurrencyFromSymbol('btc').name // Bitcoin
// ...
```

Pros: You can inline the static data in your app, instant load.
Cons: You have to bump/build/deploy each time you want the latest updated data.

So not recommended unless your app is sluggish and doesn't care about newly updated altcoins.

### Dynamic version

```ts
/* cmc.ts */
import {CMCManager} from '@vdegenne/cmc/CMCManager.js'
export * from '@vdegenne/cmc/utils.js'

export const cmcManager = new CMCManager({
	// options
})

// Usage
await cmcManager.ready
cmcManager.getCurrencyFromSymbol('btc').name // Bitcoin
// ...
```

Pros: Data is fetched from CDN which will pull latest data possible. You don't have to build everytime data changes.
Cons: More complex to integrate in your app, because now it's asynchronous and you have to make sure the data is fetched before feeding your views (use `cmcManager.ready`)

## Where to fetch data from in dynamic mode?

By default it creates the url using the follow `UrlBuilderFunction` function:

```ts
async function (getLastVersion) {
	return `https://cdn.jsdelivr.net/npm/@vdegenne/cmc@${await getLastVersion()}/mini.json`;
}
```

You can also use your own builder function:

```ts
new CMCManager({
	async remoteUrl(getLastVersion) {
		return `https://unpkg.com/@vdegenne/cmc@${await getLastVersion()}/data/all.json`
	},
})
```

Or just a simple string:

```ts
new CMCManager({
	remoteUrl: 'https://unpkg.com/@vdegenne/cmc@0.1.17/data/mini.json',
})
```
