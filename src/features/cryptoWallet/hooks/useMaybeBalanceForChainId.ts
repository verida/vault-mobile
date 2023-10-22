import { ChainId } from 'caip'

import { useWalletBannerBalance } from './useWalletBannerBalance'

export function useMaybeBalanceForChainId(chainId: ChainId | null | undefined) {
  const { list, ...extras } = useWalletBannerBalance()

  const maybeBalance =
    chainId && Array.isArray(list)
      ? list
          .filter((e) => e.token.asset.chainId.namespace === chainId.namespace)
          .find((e) => e.token.asset.chainId.reference === chainId.reference)
      : undefined

  return { ...extras, maybeBalance }
}
