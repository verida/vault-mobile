import { ChainId } from 'caip'

import { useWalletBannerBalance } from './useWalletBannerBalance'

export function useMaybeBalanceForChainId(chainId: ChainId | null | undefined) {
  const { list, ...extras } = useWalletBannerBalance()

  const maybeBalance =
    Boolean(chainId) &&
    list?.find((e) => e.asset.chainId.toString() === chainId?.toString())

  return { ...extras, maybeBalance }
}
