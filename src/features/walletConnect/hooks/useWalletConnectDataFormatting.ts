import { SupportedCaipNamespace } from 'features/caip'
import * as React from 'react'

import { WalletConnectSessionRequestCallbackParams } from '../@types'
import { extractWalletConnectChainIdOrThrow } from '../utils'
import { useWalletConnectDataFormattingNearLike } from './useWalletConnectDataFormatting.NearLike'

export function useWalletConnectDataFormatting() {
  const formatTransactionDataNearLike = useWalletConnectDataFormattingNearLike()

  const formatTransactionData = React.useCallback(
    ({
      request,
    }: Pick<WalletConnectSessionRequestCallbackParams, 'request'>): Record<
      string,
      unknown
    > => {
      const chainId = extractWalletConnectChainIdOrThrow({ request })

      const { namespace } = chainId

      if (namespace === SupportedCaipNamespace.NEAR)
        return formatTransactionDataNearLike(request.params)

      return request.params.request.params
    },
    [formatTransactionDataNearLike]
  )

  return { formatTransactionData }
}
