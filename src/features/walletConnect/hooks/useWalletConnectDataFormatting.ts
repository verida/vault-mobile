import {
  getMaybeChainMetadatas,
  SupportedCaipNamespace,
  useChainMetadatas,
} from 'features/caip'
import * as React from 'react'

import { WalletConnectSessionRequestCallbackParams } from '../@types'
import { extractWalletConnectRpcOrThrow } from '../utils'
import { useWalletConnectDataFormattingNearLike } from './useWalletConnectDataFormatting.NearLike'

export function useWalletConnectDataFormatting() {
  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  const formatTransactionDataNearLike = useWalletConnectDataFormattingNearLike()

  const formatTransactionData = React.useCallback(
    ({
      request,
    }: Pick<
      WalletConnectSessionRequestCallbackParams,
      'web3wallet' | 'request'
    >): Record<string, unknown> => {
      const { chainId } = extractWalletConnectRpcOrThrow({
        chainMetadatas,
        request,
      })

      const { namespace } = chainId

      if (namespace === SupportedCaipNamespace.NEAR)
        return formatTransactionDataNearLike(request.params)

      return request.params.request.params
    },
    [chainMetadatas, formatTransactionDataNearLike]
  )

  return { formatTransactionData }
}
