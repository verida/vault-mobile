import { AssetId, ChainId } from 'caip'
import { SupportedCaipNamespace } from 'features/caip'

import { BlockchainAccount, BlockchainNetwork } from 'api/types'
import { Option } from 'components/Select'

// Types copied from the Wallet-Provider
// TODO: Should be able to auto generated or import types directly from wallet provider module
export type ChainNameType = 'near' | 'algorand' | 'ethereum' | 'polygon'

export type BasicTokenData = {
  name: string
  symbol: string
  icon: string | undefined
  asset: AssetId
  chainName: ChainNameType

  // TODO: Clarify what "cmc" is
  cmcId?: number // if we have the CMC ID it is better because of duplicate symbols
  cmcRank?: number // use this when de-deplicating
  tokenAddress?: string
  priceAlwaysZero?: boolean
}

export type AssetQuote = {
  [currency: string]: { price: number; percent_change_24h?: number }
}

export type BasicTokenDataWithDecimal = BasicTokenData & { decimal: number }

export type BasicTokenDataWithQuote = BasicTokenDataWithDecimal & {
  quote: AssetQuote
}

export type SupportedTokenObject = BasicTokenDataWithQuote & {
  explorerURL: string
  isMainnet: boolean
  confirmations: number
  derivationPath: string
  referenceLabel?: string
}

export type BalanceByChainResultData = {
  symbol: string
  balance: number
  amount: number
  asset: AssetId
  quote: AssetQuote
  token: SupportedTokenObject
}

export type BalanceByChainResultDerivedData = {
  label: string
  price: number
  change: number | undefined
  quantity: number
}

export type BalanceByChainResult = BalanceByChainResultData &
  BalanceByChainResultDerivedData

export type SelectSingleTokenDataFailureCase =
  BalanceByChainResultDerivedData & {
    readonly amount: 0
  }

export type WithMaybeTokenType<T> = T & {
  // TODO: Elements of the codebase expect a field called tokenType, but this never seems to be assigned based upon the flow.
  //       I've left this as a placeholder (it might make sense to eventually become an enum?) to satisfy the type system, but
  //       my impression is we shouldn't use it (since all usage seems to fall back to `decimal`s instead).
  readonly tokenType?: string
}

export type SelectSingleTokenData =
  | BalanceByChainResult
  | SelectSingleTokenDataFailureCase

export interface BalanceByChain {
  totalBalance: number
  results: Array<BalanceByChainResult>
}

export enum TransactionType {
  SENT = 'sent',
  RECEIVED = 'received',
}

export interface Transaction {
  id: string
  type: TransactionType
  address: string
  quantity: bigint
  pending: boolean
}

export interface DetailedTransaction {
  id: string
  type: string
  address: string
  quantity: bigint
  pending: boolean
  fee: string
  feeDecimal: number
  feeSymbol: string
  blockNumber: string
  time: string
}
// End Wallet Provider types

export type VeridaWalletAccountOption = Option & {
  readonly caipChainId: ChainId
}

export type WalletsData = Record<string, BlockchainAccount>

export type ImportedSeedPhrase = {
  readonly phrase: string
  readonly privateKey: string
  readonly blockchainNetwork: BlockchainNetwork | null | undefined
  readonly inputSwitch: string
}

type AbstractMinifiedVeridaAccount<Namespace extends SupportedCaipNamespace> = {
  readonly namespace: Namespace
}

export type MinifiedVeridaAccountEip155 =
  AbstractMinifiedVeridaAccount<SupportedCaipNamespace.EIP_155> & {
    readonly address: string
    readonly privateKey: string
  }

// TODO: add required fields
export type MinifiedVeridaAccountNear =
  AbstractMinifiedVeridaAccount<SupportedCaipNamespace.NEAR> & {
    readonly signerId: string
    readonly privateKey: string
  }

export type MinifiedVeridaAccount =
  | MinifiedVeridaAccountEip155
  | MinifiedVeridaAccountNear
