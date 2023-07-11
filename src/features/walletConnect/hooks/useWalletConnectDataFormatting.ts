import { SupportedCaipProtocolStandard } from 'features/caip'
import * as React from 'react'

import { WalletConnectSessionRequestCallbackParams } from '../@types'
import { extractWalletConnectRpcOrThrow } from '../utils'
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

      const { standard } = parsedCaipType

      if (standard === SupportedCaipProtocolStandard.NEAR)
        return formatTransactionDataNearLike(request.params)

      return request.params.request.params
    },
    [formatTransactionDataNearLike]
  )

  return { formatTransactionData }
}
