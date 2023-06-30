import { throwIfInvalidNearSigningMethod, useNearContext } from 'features/near'
import {
  getMaybeNearAccountForWalletConnectTopic,
  resolveSessionRequest,
  useSessionRequestHandlersNear,
  WalletConnectSessionRequestCallbackParams,
} from 'features/walletConnect'
import { providers } from 'near-api-js'
import * as React from 'react'

export const useWalletConnectSessionRequestCallbackNear = (): ((
  params: WalletConnectSessionRequestCallbackParams
) => Promise<void>) => {
  const { nearNetwork: nearNetworkId, keystore } = useNearContext()

  const nearSessionRequestHandlers = useSessionRequestHandlersNear()

  return React.useCallback(
    async ({
      web3wallet,
      request,
      rpc,
    }: WalletConnectSessionRequestCallbackParams) => {
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

      const provider = new providers.JsonRpcProvider(rpc)

      return resolveSessionRequest({
        request,
        web3wallet,
        result: handle({ web3wallet, request, provider }),
      })
    },
    [nearSessionRequestHandlers]
  )
}
