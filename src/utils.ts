export function cmcIconUrl(currencyId: number) {
	return `https://s2.coinmarketcap.com/static/img/coins/64x64/${currencyId}.png`
}

export function cmcUrl(slug: string) {
	return `https://coinmarketcap.com/currencies/${slug}/`
}

export function cmcOpen(slug: string) {
	window.open(cmcUrl(slug), '_blank')
}
