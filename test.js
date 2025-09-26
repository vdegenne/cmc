import _currencies from './data/mini.json' with {type: 'json'}
export * from '@vdegenne/cmc'

export const currencies = _currencies
currencies.reverse()

export function getCMCCurrencyFromSymbol(symbol) {
	symbol = symbol.toLocaleUpperCase()
	return currencies.find((c) => symbol === c.symbol)
}

console.log(currencies.filter((c) => c.symbol === 'MIRA'))
