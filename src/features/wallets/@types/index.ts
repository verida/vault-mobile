import { AssetId } from 'caip'

// Types copied from the Wallet-Provider
// TODO: Should be able to auto generated or import types directly from wallet provider module
export type ChainNameType = 'near' | 'algorand' | 'ethereum' | 'polygon'

export type BasicTokenData = {
  name: string
  symbol: string
  icon: string | undefined
  asset: AssetId
  chainName: ChainNameType
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

export interface BalanceByChain {
  totalBalance: number
  results: Array<{
    symbol: string
    balance: number
    amount: number
    asset: AssetId
    quote: AssetQuote
    token: SupportedTokenObject

    // Derived fields
    label: string
    price: number
    change: number | undefined
    quantity: number
  }>
}

export interface Transaction {
  id: string
  type: string
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
// End Walett Provider types
