import {
  getNearAccountsForPublicKey,
  throwIfInvalidNearSigningMethod,
  useNearContext,
} from 'features/near'
import {
  resolveSessionRequest,
  useSessionRequestHandlersNear,
  WalletConnectSessionRequestCallbackParams,
} from 'features/walletConnect'
import { providers } from 'near-api-js'
import * as React from 'react'

export const useWalletConnectSessionRequestCallbackNear = (): ((
  params: WalletConnectSessionRequestCallbackParams
) => Promise<void>) => {
  const { maybeNearWalletInstance } = useNearContext()

  const nearSessionRequestHandlers = useSessionRequestHandlersNear()

  return React.useCallback(
    async ({
      web3wallet,
      request,
      rpc,
    }: WalletConnectSessionRequestCallbackParams) => {
      if (!maybeNearWalletInstance)
        throw new Error(
          `Unable to handle session_request for Near blockchain - the wallet instance was unavailable.`
        )

      const nearAccounts = await getNearAccountsForPublicKey(
        maybeNearWalletInstance
      )

      const maybeNearAccount = nearAccounts.filter(
        (e) => e.publicKey === request.topic
      )

      if (!maybeNearAccount)
        throw new Error(
          `Unable to find matching Near account for "${request.topic}".`
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
    [maybeNearWalletInstance, nearSessionRequestHandlers]
  )
}
