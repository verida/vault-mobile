import { ChainId } from 'caip'
import { keyStores, providers, transactions } from 'near-api-js'

import { BlockchainRequestHandlers } from '~/features/blockchain/types'

export type NearAccountPointer = {
  readonly publicKey: string
  // TODO: likely rename to accountId
  readonly signerId: string
  //readonly accountId: string
}

export type NearAccount = NearAccountPointer & {
  readonly caipChainId: ChainId
  readonly privateKey: string
  readonly keystore: keyStores.KeyStore
}

export enum NearRpcMethod {
  //NEAR_SIGN_IN = 'near_signIn',
  //NEAR_SIGN_OUT = 'near_signOut',
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

export type NearAccountBundle = {
  readonly nearAccount: NearAccount
  readonly nearProvider: providers.JsonRpcProvider
}

export type BlockchainRequestHandlersNear = BlockchainRequestHandlers<
  NearRpcMethod,
  NearAccountBundle
>
