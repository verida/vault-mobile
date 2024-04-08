import * as React from 'react'

import { useGetBalancesQuery } from '../api'
import { BalanceByChainResult, isBalanceByChainResult } from '../types'
import { getUniqueWalletAddresses } from '../utils'
import { useSelectedWallet } from './useSelectedWallet'

export function useBalanceByChainResultsForUniqueWalletAddresses() {
  const currentCryptoWallet = useSelectedWallet()

  const {
    data,
    isLoading,
    isFetching,
    error: cause,
    refetch,
  } = useGetBalancesQuery(
    React.useMemo(
      () => getUniqueWalletAddresses(currentCryptoWallet),
      [currentCryptoWallet]
    )
  )

  const loading = isLoading || isFetching

  return React.useMemo(() => {
    const maybeBalanceByChainResults = data?.list

    const balanceByChainResults: readonly BalanceByChainResult[] = (
      maybeBalanceByChainResults || []
    ).flatMap((e) => (isBalanceByChainResult(e) ? [e] : []))

    return {
      balanceByChainResults,
      loading,
      error: cause
        ? new Error('Unable to load BalanceByChainResults.', { cause })
        : undefined,
      refetch,
    }
  }, [data, loading, cause, refetch])
}
