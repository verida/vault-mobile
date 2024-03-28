import { SUPPORTED_BLOCKCHAIN_NAMESPACES } from 'features/blockchain'

import { AggregateWalletBannerBalances } from '../@types'

/**
 * Do not modify unless there's proper migration or handling
 */
export const CRYPTO_WALLETS_STORAGE_KEY = 'wallets-v4'

/**
 * Do not modify unless there's proper migration or handling
 */
export const SELECTED_CRYPTO_WALLET_STORAGE_KEY = 'selected-wallet'

export const DEFAULT_MULTI_CHAIN_WALLET_LABEL = 'Multi-chain Wallet'

export const DEFAULT_AGGREGATE_WALLET_BANNER_BALANCES_RESULT: AggregateWalletBannerBalances =
  Object.freeze([])

// TODO: Register this scheme on iOS and Android for deep links
export const SUPPORTED_BLOCKCHAIN_REQUEST_URL_SCHEMES = [
  'ethereum',
  ...SUPPORTED_BLOCKCHAIN_NAMESPACES,
]
