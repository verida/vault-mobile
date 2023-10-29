import * as React from 'react'
import { useSelector } from 'react-redux'

import { BalanceByChainResult, isBalanceByChainResult } from '../@types'
import { useGetBalancesQuery } from '../api'
import { getUniqueWalletAddresses, getWallets } from '../slice'

export function useBalanceByChainResultsForUniqueWalletAddresses() {
  const wallets = useSelector(getWallets)

  const {
    data,
    isLoading: loading,
    error: cause,
    refetch,
  } = useGetBalancesQuery(
    React.useMemo(() => getUniqueWalletAddresses(wallets), [wallets])
  )

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
