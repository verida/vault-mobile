import { throwIfInvalidNearSigningMethod, useNearContext } from 'features/near'
import {
  getMaybeNearAccountForWalletConnectTopic,
  useSessionRequestHandlersNear,
  WalletConnectSessionRequestCallbackParams,
} from 'features/walletConnect'
import * as React from 'react'

export const useWalletConnectSessionRequestApproveCallbackNear = (): ((
  params: WalletConnectSessionRequestCallbackParams
) => Promise<unknown>) => {
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

      return handle({ web3wallet, request, rpc })
    },
    [keystore, nearNetworkId, nearSessionRequestHandlers]
  )
}
