import { AssetType, ChainId } from 'caip'
import * as React from 'react'

import { useGetTransactionsForTokenQuery } from '../api'
import { useSelectedCryptoWallet } from './useSelectedCryptoWallet'

export function useTransactionsForMaybeAssetId({
  assetType: maybeAssetType,
}: {
  readonly assetType: AssetType | null | undefined
}) {
  const assetChainId = maybeAssetType?.chainId
    ? new ChainId(maybeAssetType.chainId)
    : null

  const selectedCryptoWallet = useSelectedCryptoWallet()
  const accounts = selectedCryptoWallet?.accounts || []
  const account = assetChainId
    ? accounts.find(
        (accountItem) => accountItem.namespace === assetChainId.namespace
      )
    : undefined
  const address = account?.address || null

  const asset = maybeAssetType || null

  const skip = !address || !asset

  const {
    data,
    isLoading: loading,
    error: error,
    refetch,
  } = useGetTransactionsForTokenQuery(
    {
      userAddress: address,
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
