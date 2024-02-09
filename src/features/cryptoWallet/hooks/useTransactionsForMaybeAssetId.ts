import { AssetId, ChainId } from 'caip'
import * as React from 'react'

import { useGetTransactionsForTokenQuery } from '../api'
import { useMaybeSelectedWallet } from './useMaybeSelectedWallet'

export function useTransactionsForMaybeAssetId({
  assetId: maybeAssetId,
}: {
  readonly assetId: AssetId | null | undefined
}) {
  const chainId = maybeAssetId?.chainId
    ? new ChainId(maybeAssetId.chainId).toString()
    : null

  const selectedWallet = useMaybeSelectedWallet()
  const accounts = Object.values(selectedWallet?.accounts || {})
  const account = chainId
    ? accounts.find((accountItem) => accountItem.chainId === chainId)
    : undefined

  const userAddress = account?.address || null
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
