import { SUPPORTED_BLOCKCHAIN_NAMESPACES } from 'features/blockchain'

import {
  AggregateWalletBannerBalances,
  Currency,
  CurrencySymbols,
} from '../@types'

export const WALLET_SCHEMA_0_2_0_URI =
  'https://vault.schemas.verida.io/wallets/v0.2.0/schema.json'

export const DEFAULT_AGGREGATE_WALLET_BANNER_BALANCES_RESULT: AggregateWalletBannerBalances =
  Object.freeze([])

export const CURRENCY_SYMBOLS: CurrencySymbols = {
  [Currency.USD]: '$',
}

// TODO: Register this scheme on iOS and Android for deep links
export const SUPPORTED_BLOCKCHAIN_REQUEST_URL_SCHEMES = [
  'ethereum',
  ...SUPPORTED_BLOCKCHAIN_NAMESPACES,
]
