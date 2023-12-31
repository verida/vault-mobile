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

  const userAddress = maybeAddress || null
  const asset = maybeAssetId || null

  const skip = !userAddress || !asset

  const {
    data,
    isLoading: loading,
    error: error,
    refetch,
  } = useGetTransactionsForTokenQuery(
    {
      userAddress,
      asset,
    },
    {
      skip,
    }
  )

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
