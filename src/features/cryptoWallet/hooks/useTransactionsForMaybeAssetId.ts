import { AssetType, ChainId } from 'caip'
import * as React from 'react'

import { useGetTransactionsForTokenQuery } from '../api'
import { useMaybeSelectedWallet } from './useMaybeSelectedWallet'

export function useTransactionsForMaybeAssetId({
  assetType: maybeAssetType,
}: {
  readonly assetType: AssetType | null | undefined
}) {
  const chainId = maybeAssetType?.chainId
    ? new ChainId(maybeAssetType.chainId).toString()
    : null

  const selectedWallet = useMaybeSelectedWallet()
  const accounts = Object.values(selectedWallet?.accounts || {})
  const account = chainId
    ? accounts.find((accountItem) => accountItem.chainId === chainId)
    : undefined

  const userAddress = account?.address || null
  const asset = maybeAssetType || null

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
