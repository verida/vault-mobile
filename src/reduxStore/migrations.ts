import { assetsApi } from '~/features/assets'
import { blockchainApi } from '~/features/blockchain'
import { cryptoWalletApi } from '~/features/cryptoWallet'

import { RootState } from './types'

// FIXME: can't use RootState as type here because of circularly references itself
type MigrationFunction = (state: any) => any

export const REDUX_PERSIST_CURRENT_VERSION = 2

export const reduxPersistMigrations: Record<number, MigrationFunction> = {
  1: (state: RootState) => {
    // Clears out the blockchain API cache
    return {
      ...state,
      [blockchainApi.reducerPath]: undefined,
      [cryptoWalletApi.reducerPath]: undefined,
      [assetsApi.reducerPath]: undefined,
    }
  },
  2: (state: RootState) => {
    // Clears out the blockchain API cache
    return {
      ...state,
      [blockchainApi.reducerPath]: undefined,
      [cryptoWalletApi.reducerPath]: undefined,
      [assetsApi.reducerPath]: undefined,
    }
  },
}
