export {}

declare global {
	namespace CMC {
		export interface MapAllResponse {
			data: {
				cryptoCurrencyMap: Currency[]
				exchangeMap: Exchange[]
				totalCount: number
			}
			status: {
				timestamp: string
				error_code: string | null
				error_message: string | null
				elapsed: number
				credit_count: number
			}
		}

		export interface Currency {
			id: number
			name: string
			symbol: string
			slug: string
			rank: number
			isActive: number // 1 = active, 0 = inactive
			status: string // "active", "untracked", etc.
			platformId?: number // optional, for tokens
			// optional: first/last historical data timestamps if needed
			first_historical_data?: string
			last_historical_data?: string
		}
		export interface MiniCurrency {
			id: number
			name: string
			symbol: string
			slug: string
		}

		export interface Exchange {
			id: number
			name: string
			slug: string
			isActive: number
			status: string
		}
	}
}
