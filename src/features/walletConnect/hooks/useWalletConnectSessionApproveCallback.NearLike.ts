import { throwIfInvalidNearSigningMethod, useNearContext } from 'features/near'
import * as React from 'react'

import { WalletConnectSessionRequestCallbackParams } from '../@types'
import { getMaybeNearAccountForWalletConnectTopic } from '../utils'
import { useWalletConnectSessionRequestHandlersNearLike } from './useWalletConnectSessionRequestHandlers.NearLike'

export const useWalletConnectSessionApproveCallbackNearLike = (): ((
  params: WalletConnectSessionRequestCallbackParams
) => Promise<unknown>) => {
  const { nearNetworkParsedCaipType, keystore } = useNearContext()

  const nearSessionRequestHandlers =
    useWalletConnectSessionRequestHandlersNearLike()

  return React.useCallback(
    async ({
      web3wallet,
      request,
      rpc,
    }: WalletConnectSessionRequestCallbackParams): Promise<unknown> => {
      const { topic } = request

      const maybeNearAccount = await getMaybeNearAccountForWalletConnectTopic({
        nearNetworkParsedCaipType,
        topic,
        keystore,
      })

      if (!maybeNearAccount)
        throw new Error(
          `No active account. Unable to find matching Near account for "${topic}".`
        )

      const method = request?.params?.request?.method

      if (!throwIfInvalidNearSigningMethod(method)) return

      const { [method]: handle } = nearSessionRequestHandlers

      return handle({ web3wallet, request, rpc })
    },
    [keystore, nearNetworkParsedCaipType, nearSessionRequestHandlers]
  )
}
