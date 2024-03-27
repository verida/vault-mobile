import { SUPPORTED_BLOCKCHAIN_NAMESPACES } from 'features/blockchain'

import { AggregateWalletBannerBalances } from '../@types'

export const DEFAULT_AGGREGATE_WALLET_BANNER_BALANCES_RESULT: AggregateWalletBannerBalances =
  Object.freeze([])

// TODO: Register this scheme on iOS and Android for deep links
export const SUPPORTED_BLOCKCHAIN_REQUEST_URL_SCHEMES = [
  'ethereum',
  ...SUPPORTED_BLOCKCHAIN_NAMESPACES,
]
