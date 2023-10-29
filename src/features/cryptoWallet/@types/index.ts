import { AssetId, AssetIdParams, ChainIdParams } from 'caip'
import { SupportedCaipNamespace } from 'features/caip'

import { BlockchainAccount, BlockchainNetwork } from 'api/types'
import { Option } from 'components/Select'

// Types copied from the Wallet-Provider
// TODO: Should be able to auto generated or import types directly from wallet provider module
export type ChainNameType = 'near' | 'algorand' | 'ethereum' | 'polygon'

export type BasicTokenData = WithMaybeIcon<{
  name: string
  symbol: string
  asset: AssetId
  chainName: ChainNameType

  // TODO: Clarify what "cmc" is
  cmcId?: number // if we have the CMC ID it is better because of duplicate symbols
  cmcRank?: number // use this when de-deplicating
  tokenAddress?: string
  priceAlwaysZero?: boolean
}>

export type AssetQuote = {
  [currency: string]: { price: number; percent_change_24h?: number }
}

export type WithDecimal<T> = T & {
  readonly decimal: number
}

export type BasicTokenDataWithDecimal = WithDecimal<BasicTokenData>

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

export type BalanceByChainAmount<T extends number = number> = {
  readonly amount: T
}

export type BalanceByChainResultData = BalanceByChainAmount & {
  symbol: string
  balance: number
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

export type SelectSingleTokenDataFailureCase = BalanceByChainResultDerivedData &
  BalanceByChainAmount<0>

export type WithMaybeTokenType<T> = T & {
  // TODO: Elements of the codebase expect a field called tokenType, but this never seems to be assigned based upon the flow.
  //       I've left this as a placeholder (it might make sense to eventually become an enum?) to satisfy the type system, but
  //       my impression is we shouldn't use it (since all usage seems to fall back to `decimal`s instead).
  readonly tokenType?: string
}

export type WithMaybeIcon<T> = T & {
  readonly icon?: string
}

export type SelectSingleTokenData =
  | BalanceByChainResult
  | SelectSingleTokenDataFailureCase

export const isBalanceByChainResult = (
  selectSingleTokenData: SelectSingleTokenData
): selectSingleTokenData is BalanceByChainResult => {
  if (!selectSingleTokenData || typeof selectSingleTokenData !== 'object')
    return false
  // TODO: Are there any simpler/additional checks we can perform?
  return 'asset' in selectSingleTokenData
}

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

export type VeridaWalletAccountOption = Option
// & {
//  readonly caipChainId: ChainId
//}

export type WalletsData = Record<string, BlockchainAccount>

export type ImportedSeedPhrase = {
  readonly phrase: string
  readonly privateKey: string
  readonly blockchainNetwork: BlockchainNetwork | null | undefined
  readonly inputSwitch: string
}

type AbstractMinifiedVeridaAccount<Namespace extends SupportedCaipNamespace> = {
  readonly address: string
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
    // TODO: Note near uses slightly different terminology... address === signerId!
    //readonly signerId: string
    readonly privateKey: string
  }

export type MinifiedVeridaAccount =
  | MinifiedVeridaAccountEip155
  | MinifiedVeridaAccountNear

export type MinifiedVeridaAccounts = readonly MinifiedVeridaAccount[]

export enum Currency {
  USD = 'USD',
}

export type CurrencySymbols = {
  readonly [key in Currency]: string
}

export enum Interval {
  DAILY = 'DAILY',
}

// TODO: Should be a BigDecimal
export type PriceIntervals = {
  readonly [key in Interval]: number
}

export type Valuation = {
  readonly currency: Currency
  // TODO: Should be a BigDecimal
  readonly price: number
}

export type DetailedValuation = Valuation & {
  // Historic rates over a range of intervals.
  readonly rates: PriceIntervals
  // Defines how much a whole unit of an asset is worth in terms of `currency`.
  // TODO: Should be a BigDecimal
  readonly conversionRate: number
}

export type ValuedAtWithAccuracy<T extends Valuation = Valuation> = T & {
  readonly isAccurate: boolean
}

export enum AggregateWalletBannerBalanceType {
  // i.e. ETH
  BASE_CURRENCY /* TODO: slip44? */,
  // i.e. USDC
  ERC_20,
}

// TODO: Move somewhere more general, we do this a lot
export type ResourceParams = ChainIdParams | AssetIdParams

export function isAssetIdResourceParams(
  resourceParams: ResourceParams
): resourceParams is AssetIdParams {
  // TODO: maybe settle on a better implementation - needs tests
  return (
    'tokenId' in resourceParams &&
    typeof resourceParams.tokenId === 'string' &&
    Boolean(resourceParams.tokenId.length)
  )
}

export function isChainIdResourceParams(
  resourceParams: ResourceParams
): resourceParams is ChainIdParams {
  return !isChainIdResourceParams(resourceParams)
}

type AbstractAggregateWalletBannerBalance<
  Resource extends ResourceParams,
  Type extends AggregateWalletBannerBalanceType
> = {
  /* required */
  readonly resource: Resource
  readonly type: Type
  readonly decimals: number

  // Defines price information for the asset - this can currenttly only be
  // determined by querying the Wallet Provider API, meaning custom networks
  // cannot define a concrete valuation.
  readonly valuation: DetailedValuation | null

  // TODO: look at removing getTokenUnitName
  // TODO: look at getTokenUnitName() -> probably can be found by looking at network config
  // A stringified integer amount of tokens held. For example, 1 ETH would be `${ethers.weiPerEther}`.
  readonly balance: string
  readonly symbol: string | null
  readonly icon: string | null
  readonly label: string
}

export type AggregateWalletBannerBalanceBaseCurrency =
  AbstractAggregateWalletBannerBalance<
    ChainIdParams,
    AggregateWalletBannerBalanceType.BASE_CURRENCY
  >

export type AggregateWalletBannerBalanceErc20 =
  AbstractAggregateWalletBannerBalance<
    AssetIdParams,
    AggregateWalletBannerBalanceType.ERC_20
  >

// A balance may be denoted in a blockchain's base currency or a fungible
// asset expressed on top of the protocol.
export type AggregateWalletBannerBalance =
  | AggregateWalletBannerBalanceBaseCurrency
  | AggregateWalletBannerBalanceErc20

export type AggregateWalletBannerBalances =
  readonly AggregateWalletBannerBalance[]

export type UseAggregateWalletBannerBalancesParams = {
  // Defines whether to filter the balances returned by a specific resource reference.
  // This can be scoped to a specific chain, or a given asset on a specific chain.
  readonly resource?: ResourceParams
}

export type UseAggregateWalletBannerBalancesState = Readonly<
  | { loading: true }
  | { loading: false; result: AggregateWalletBannerBalances }
  | { loading: false; error: Error }
>

export type CryptoWalletBalance = {
  readonly [address: string]: string | null
}

export type CryptoWalletBalances = {
  readonly [caipId: string]: CryptoWalletBalance
}

export type UseCreateCryptoWalletBalancesState = Readonly<
  | { loading: true }
  | { loading: false; data: CryptoWalletBalances }
  | { loading: false; error: Error }
>

export type RefetchCryptoWalletBalances = () => Promise<CryptoWalletBalances>

export type UseCreateCryptoWalletBalancesResult =
  UseCreateCryptoWalletBalancesState & {
    readonly refetch: RefetchCryptoWalletBalances
  }

export type CryptoWalletContextValue = UseCreateCryptoWalletBalancesResult
