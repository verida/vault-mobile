import { AssetId } from 'caip'
import * as React from 'react'

import { useGetTransactionsForTokenQuery } from '../api'
import { getWalletAddressForAsset } from '../utils'
import { useSelectedMinifiedBlockchainAccounts } from './useSelectedMinifiedBlockchainAccounts'

export function useTransactionsForMaybeAssetId({
  assetId: maybeAssetId,
}: {
  readonly assetId: AssetId | null | undefined
}) {
  const minifiedBlockchainAccounts = useSelectedMinifiedBlockchainAccounts()

  const maybeAddress = getWalletAddressForAsset(
    maybeAssetId,
    minifiedBlockchainAccounts
  )

  const {
    data,
    isLoading: loading,
    error: error,
    refetch,
  } = useGetTransactionsForTokenQuery({
    userAddress: maybeAddress || null,
    asset: maybeAssetId || null,
  })

  return React.useMemo(
    () => ({
      transactions: data || [],
      loading,
      error: error
        ? new Error('Failed to load transactions', { cause: error })
        : undefined,
      refetch,
    }),
    [data, loading, error, refetch]
  )
}
