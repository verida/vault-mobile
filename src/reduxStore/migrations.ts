import { RootState } from './types'

// FIXME: can't use RootState as type here because of circularly references itself
type MigrationFunction = (state: any) => any

export const REDUX_PERSIST_CURRENT_VERSION = 1

export const reduxPersistMigrations: Record<number, MigrationFunction> = {
  1: (state: RootState) => {
    // This migration clear out API cache as introduce blockchain Mainnet support
    return {
      ...state,
      blockchainApi: undefined,
      assetsApi: undefined,
      cryptoWalletApi: undefined,
    }
  },
}
