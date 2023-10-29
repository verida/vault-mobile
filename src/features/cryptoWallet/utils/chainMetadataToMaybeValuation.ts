import { ChainId } from 'caip'
import { ChainMetadata } from 'features/caip'

import {
  BalanceByChainResult,
  Currency,
  DetailedValuation,
  Interval,
} from '../@types'

export function chainMetadataToMaybeValuation({
  chainMetadata,
  balanceByChainResults,
}: {
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
    amount: price,
    price: conversionRate,
    change: maybeChange,
  } = maybeBalanceByChainResult

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
