import * as React from 'react'
import { useSelector } from 'react-redux'

import { useGetBalancesQuery } from '../api'
import { getUniqueWalletAddresses, getWallets } from '../slice'
import { BalanceByChainResult, isBalanceByChainResult } from '../types'

export function useBalanceByChainResultsForUniqueWalletAddresses() {
  const wallets = useSelector(getWallets)

  const {
    data,
    isLoading,
    isFetching,
    error: cause,
    refetch,
  } = useGetBalancesQuery(
    React.useMemo(() => getUniqueWalletAddresses(wallets), [wallets])
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
