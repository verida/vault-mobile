import * as React from 'react'

import { getBlockchainNetworks } from '~/features/blockchain'
import { useAppSelector } from '~/reduxStore/types'

import { useGetBalancesQuery } from '../api'
import { BalanceByChainResult, isBalanceByChainResult } from '../types'
import { getCryptoWalletAccountIds } from '../utils'
import { useSelectedCryptoWallet } from './useSelectedCryptoWallet'

export function useBalanceByChainResultsForUniqueWalletAddresses() {
  const blockchains = useAppSelector(getBlockchainNetworks)

  const selectedCryptoWallet = useSelectedCryptoWallet()

  const {
    data,
    isLoading,
    isFetching,
    error: cause,
    refetch,
  } = useGetBalancesQuery(
    React.useMemo(() => {
      const accountIds = selectedCryptoWallet
        ? getCryptoWalletAccountIds(
            selectedCryptoWallet,
            Object.values(blockchains)
          )
        : []
      return accountIds.map((accountId) => accountId.toString())
    }, [blockchains, selectedCryptoWallet])
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
