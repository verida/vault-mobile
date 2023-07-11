import * as React from 'react'

import {
  WalletConnectChainStyle,
  WalletConnectSessionRequestCallbackParams,
} from '../@types'
import {
  extractWalletConnectRpcOrThrow,
  getWalletConnectConfigForChainIdOrThrow,
} from '../utils'
import { useWalletConnectDataFormattingNearLike } from './useWalletConnectDataFormatting.NearLike'

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
      const { parsedCaipType } = extractWalletConnectRpcOrThrow(
        web3wallet,
        request
      )
      const { style } = getWalletConnectConfigForChainIdOrThrow(parsedCaipType)

      if (style === WalletConnectChainStyle.NEAR_LIKE)
        return formatTransactionDataNearLike(request.params)

      return request.params.request.params
    },
    [formatTransactionDataNearLike]
  )

  return { formatTransactionData }
}
