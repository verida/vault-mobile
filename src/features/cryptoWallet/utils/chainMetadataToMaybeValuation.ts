import { ChainId } from 'caip'
import { ChainMetadata } from 'features/caip'

import { BalanceByChainResult, DetailedValuation } from '../@types'
import { balanceByChainResultToValuation } from './balanceByChainResultToValuation'

export function chainMetadataToMaybeValuation({
  balance,
  decimals,
  chainMetadata,
  balanceByChainResults,
}: {
  readonly decimals: number
  readonly balance: `${number}`
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

  return balanceByChainResultToValuation({
    balanceByChainResult: maybeBalanceByChainResult,
    balance,
    decimals,
  })
}
