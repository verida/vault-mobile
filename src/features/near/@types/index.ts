import { NearKeystore } from 'features/near'
import { KeyPair } from 'near-api-js'

import { BlockchainWalletWithAccounts } from 'api/types'

// https://github.com/verida/vault-mobile/blob/develop/src/wallet-connect/controllers/near.ts
// TODO: This is supposed to represent the data we save in Redux for Near wallets. Is this correct?
export type SerializedNearWallet = {
  readonly publicKey: string
  readonly privateKey: string
}

// TODO: Is this a Verida concept or Near?
// TODO: Reinforce
// TODO: Branded type for <Blockchain:VeridaNetwork>
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
