import {
  WalletConnectChainMeta,
  WalletConnectChainStyle,
} from 'features/walletConnect'

import { WALLETCONNECT_SUPPORTED_CHAINS } from '../constants'

export function getMaybeWalletConnectConfigForChainId(
  chainId: string | null | undefined
): WalletConnectChainMeta<unknown, WalletConnectChainStyle> | undefined {
  if (typeof chainId !== 'string' || !chainId.length) return undefined

  const maybeMatchingChainConfig = Object.values(
    WALLETCONNECT_SUPPORTED_CHAINS
  ).find(
    ({ chainId: maybeMatchingChainId }) => maybeMatchingChainId === chainId
  )

  return maybeMatchingChainConfig || undefined
}

export function getWalletConnectConfigForChainIdOrThrow(
  chainId: string | null | undefined
): WalletConnectChainMeta<unknown, WalletConnectChainStyle> {
  const maybeWalletConnectConfig =
    getMaybeWalletConnectConfigForChainId(chainId)

  if (!maybeWalletConnectConfig)
    throw new Error(
      `Unable to find WalletConnectConfig for chainId "${chainId}".`
    )

  return maybeWalletConnectConfig
}
