import { ParsedCaipType, stringifyCaip } from 'features/caip'

import { WalletConnectChainMeta, WalletConnectChainStyle } from '../@types'
import { WALLETCONNECT_SUPPORTED_CHAINS } from '../constants'

export function getMaybeWalletConnectConfigForChainId(
  parsedCaipType: ParsedCaipType | null | undefined
): WalletConnectChainMeta<WalletConnectChainStyle> | undefined {
  if (!parsedCaipType) return undefined

  const maybeMatchingChainConfig = Object.values(
    WALLETCONNECT_SUPPORTED_CHAINS
  ).find(
    ({ chainId: maybeMatchingChainId }) =>
      maybeMatchingChainId === parsedCaipType.chainId
  )

  return maybeMatchingChainConfig || undefined
}

export function getWalletConnectConfigForChainIdOrThrow(
  parsedCaipType: ParsedCaipType
): WalletConnectChainMeta<WalletConnectChainStyle> {
  const maybeWalletConnectConfig =
    getMaybeWalletConnectConfigForChainId(parsedCaipType)

  if (!maybeWalletConnectConfig)
    throw new Error(
      `Unable to find WalletConnectConfig for "${stringifyCaip(
        parsedCaipType
      )}".`
    )

  return maybeWalletConnectConfig
}
