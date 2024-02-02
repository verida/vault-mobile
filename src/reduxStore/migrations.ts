import { assetsApi } from 'features/assets'
import { blockchainApi } from 'features/blockchain'
import { cryptoWalletApi } from 'features/cryptoWallet'

import { RootState } from './types'

// FIXME: can't use RootState as type here because of circularly references itself
type MigrationFunction = (state: any) => any

export const REDUX_PERSIST_CURRENT_VERSION = 1

export const reduxPersistMigrations: Record<number, MigrationFunction> = {
  1: (state: RootState) => {
    // This migration clears out the blockchain API cache cause of introducing blockchain Mainnet support
    return {
      ...state,
      [blockchainApi.reducerPath]: undefined,
      [cryptoWalletApi.reducerPath]: undefined,
      [assetsApi.reducerPath]: undefined,
    }
  },
}
