import { ChainId } from 'caip'
import { ChainMetadata } from 'features/caip'

import {
  BalanceByChainResult,
  Currency,
  DetailedValuation,
  Interval,
} from '../@types'
import { getAggregateWalletBannerBalanceAsNumeric } from './getAggregateWalletBannerBalanceAsNumeric'

export function chainMetadataToMaybeValuation({
  balance,
  decimals,
  chainMetadata,
  balanceByChainResults,
}: {
  readonly decimals: number
  readonly balance: string
  readonly chainMetadata: ChainMetadata
  readonly balanceByChainResults: readonly BalanceByChainResult[]
}): DetailedValuation | null {
  // Determine if we can find a matching BalanceByChainResult.
  const maybeBalanceByChainResult = balanceByChainResults.find(
    (e) =>
      new ChainId(e.asset.chainId).toString() ===
      new ChainId(chainMetadata).toString()
  )

  if (!maybeBalanceByChainResult) return null

  // TODO: oh jeez i am sorry
  const {
    //amount: price,
    price: conversionRate,
    change: maybeChange,
  } = maybeBalanceByChainResult

  const price =
    getAggregateWalletBannerBalanceAsNumeric({
      balance,
      decimals,
    }) * conversionRate

  return {
    // HACK: The Wallet Provider currently only supports USD.
    currency: Currency.USD,
    price,
    conversionRate,
    rates: {
      [Interval.DAILY]: maybeChange || 0,
    },
  }
}
