import * as React from 'react'

import { SupportedBlockchainNamespace } from '~/features/blockchain/types/enums'

import { WalletConnectSessionRequestCallbackParams } from '../types'
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

      if (namespace === SupportedBlockchainNamespace.NEAR)
        return formatTransactionDataNearLike(request.params)

      return request.params.request.params
    },
    [formatTransactionDataNearLike]
  )

  return { formatTransactionData }
}
