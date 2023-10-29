import { AssetId } from 'caip'
import * as React from 'react'

import { useGetTransactionsForTokenQuery } from '../api'
import { getWalletAddressForAsset } from '../utils'
import { useSelectedMinifiedVeridaAccounts } from './useSelectedMinifiedVeridaAccounts'

export function useTransactionsForMaybeAssetId({
  assetId: maybeAssetId,
}: {
  readonly assetId: AssetId | null | undefined
}) {
  const minifiedVeridaAccounts = useSelectedMinifiedVeridaAccounts()

  const maybeAddress = getWalletAddressForAsset(
    maybeAssetId,
    minifiedVeridaAccounts
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
