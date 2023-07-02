import { throwIfInvalidNearSigningMethod, useNearContext } from 'features/near'
import {
  getMaybeNearAccountForWalletConnectTopic,
  useSessionRequestHandlersNearLike,
  WalletConnectSessionRequestCallbackParams,
} from 'features/walletConnect'
import * as React from 'react'

export const useWalletConnectSessionRequestApproveCallbackNearLike = (): ((
  params: WalletConnectSessionRequestCallbackParams
) => Promise<unknown>) => {
  const { nearNetwork: nearNetworkId, keystore } = useNearContext()

  const nearSessionRequestHandlers = useSessionRequestHandlersNearLike()

  return React.useCallback(
    async ({
      web3wallet,
      request,
      rpc,
    }: WalletConnectSessionRequestCallbackParams): Promise<unknown> => {
      const { topic } = request

      const maybeNearAccount = await getMaybeNearAccountForWalletConnectTopic({
        nearNetworkId,
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
    [keystore, nearNetworkId, nearSessionRequestHandlers]
  )
}
