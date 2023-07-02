import {
  extractWalletConnectRpcOrThrow,
  getWalletConnectConfigForChainIdOrThrow,
  useWalletConnectDataFormattingNearLike,
  WalletConnectChainStyle,
  WalletConnectSessionRequestCallbackParams,
} from 'features/walletConnect'
import * as React from 'react'

export function useWalletConnectDataFormatting() {
  const formatTransactionDataNearLike = useWalletConnectDataFormattingNearLike()

  const formatTransactionData = React.useCallback(
    ({
      web3wallet,
      request,
    }: Pick<
      WalletConnectSessionRequestCallbackParams,
      'web3wallet' | 'request'
    >): Record<string, unknown> => {
      const { chainId } = extractWalletConnectRpcOrThrow(web3wallet, request)
      const { style } = getWalletConnectConfigForChainIdOrThrow(chainId)

      const data = request.params

      if (style === WalletConnectChainStyle.NEAR_LIKE)
        return formatTransactionDataNearLike(data)

      return data
    },
    [formatTransactionDataNearLike]
  )

  return { formatTransactionData }
}
