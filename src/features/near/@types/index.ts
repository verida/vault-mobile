import { NearKeystore } from 'features/near'
import { KeyPair } from 'near-api-js'

import { BlockchainWalletWithAccounts } from 'api/types'

// https://github.com/verida/vault-mobile/blob/develop/src/wallet-connect/controllers/near.ts
// TODO: Is this true?
export type NearWallet = BlockchainWalletWithAccounts & {
  // TODO: This is likely an indication that a NearWallet is NOT BlockchainWalletWithAccounts.
  readonly publicKey: string
}

// TODO: Is this a Verida concept or Near?
// TODO: Reinforce
export type NearNetworkId = 'testnet'

export type NearDevAccount = {
  readonly accountId: string
  readonly keyPair: KeyPair
}

export type NearWalletInstance = {
  readonly publicKey: string
  readonly networkId: NearNetworkId
  readonly keystore: NearKeystore
}

export type NearWalletAccountInfo = {
  readonly publicKey: string
  readonly accountId: string
}

export type NearContextValue = {
  readonly maybeNearWalletInstance: NearWalletInstance | undefined
  readonly maybeNearWalletAccounts: readonly NearWalletAccountInfo[]
  readonly nearNetwork: NearNetworkId
}
