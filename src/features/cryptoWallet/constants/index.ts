import { BLOCKCHAIN_NAMESPACES } from '~/features/blockchain'

import { AggregateWalletBannerBalances } from '../types'

export const VAULT_SCHEMA_WALLETS_0_2_0 =
  'https://vault.schemas.verida.io/wallets/v0.2.0/schema.json'

/**
 * Do not modify unless there's proper migration or handling
 */
export const CRYPTO_WALLETS_STORAGE_KEY = 'wallets-v4'

/**
 * Do not modify unless there's proper migration or handling
 */
export const SELECTED_CRYPTO_WALLET_STORAGE_KEY = 'selected-wallet'

export const DEFAULT_MULTI_CHAIN_WALLET_LABEL = 'Multi-chain Wallet'
export const DEFAULT_SINGLE_CHAIN_WALLET_LABEL = 'Crypto Wallet'

export const DEFAULT_AGGREGATE_WALLET_BANNER_BALANCES_RESULT: AggregateWalletBannerBalances =
  Object.freeze([])

// TODO: Register this scheme on iOS and Android for deep links
export const SUPPORTED_BLOCKCHAIN_REQUEST_URL_SCHEMES = [
  'ethereum',
  ...BLOCKCHAIN_NAMESPACES,
]

export const WALLET_TYPES = ['multi', ...BLOCKCHAIN_NAMESPACES] as const
