import { keyStores, transactions } from 'near-api-js'

// TODO: sanity check usage
// TODO: rename to reflect caip
// TODO: make NearNetworkId function of connection config
export enum NearNetworkId {
  TESTNET = 'near:testnet',
}

export type NearAccountPointer = {
  readonly publicKey: string
  readonly accountId: string
}

export type NearAccount = NearAccountPointer & {
  readonly signerId: string
  readonly nearNetworkId: NearNetworkId
  readonly keystore: keyStores.KeyStore
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
