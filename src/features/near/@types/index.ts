import { ParsedCaipType } from 'features/caip'
import { KeyPair, transactions } from 'near-api-js'

import { NearKeystore } from '../classes/Near.Keystore'

// https://github.com/verida/vault-mobile/blob/develop/src/wallet-connect/controllers/near.ts
// TODO: This is supposed to represent the data we save in Redux for Near wallets. Is this correct?
export type SerializedNearWallet = {
  readonly publicKey: string
  readonly privateKey: string
}

// TODO: sanity check usage
// TODO: rename to reflect caip
export enum NearNetworkId {
  TESTNET = 'near:testnet',
}

export type NearDevAccount = {
  readonly accountId: string
  readonly keyPair: KeyPair
}

export type NearWalletInstance = {
  readonly publicKey: string
  readonly nearNetworkParsedCaipType: ParsedCaipType
  readonly keystore: NearKeystore
}

export type NearWalletAccountInfo = {
  readonly publicKey: string
  readonly accountId: string
}

export type NearContextValue = {
  readonly keystore: NearKeystore
  //readonly maybeNearWalletInstance: NearWalletInstance | undefined
  //readonly maybeNearWalletAccounts: readonly NearWalletAccountInfo[]
  readonly nearNetworkParsedCaipType: ParsedCaipType
}

export enum NearSigningMethod {
  NEAR_SIGN_IN = 'near_signIn',
  NEAR_SIGN_OUT = 'near_signOut',
  NEAR_GET_ACCOUNTS = 'near_getAccounts',
  NEAR_SIGN_TRANSACTION = 'near_signTransaction',
  NEAR_SIGN_AND_SEND_TRANSACTION = 'near_signAndSendTransaction',
  NEAR_SIGN_TRANSACTIONS = 'near_signTransactions',
  NEAR_SIGN_AND_SEND_TRANSACTIONS = 'near_signAndSendTransactions',
}

export type NearTransactionActions = transactions.Action[]

export interface NearTransaction {
  signerId: string
  receiverId: string
  actions: NearTransactionActions
}
