import {
  NearSigningMethod,
  throwIfInvalidNearSigningMethod,
  useNearContext,
} from 'features/near'
import {
  getMaybeNearAccountForWalletConnectTopic,
  resolveSessionRequest,
  useSessionRequestHandlersNear,
  WalletConnectSessionRequestCallbackParams,
  WalletConnectTransactionRequestModal,
} from 'features/walletConnect'
import { useModal } from 'hooks'
import { providers } from 'near-api-js'
import * as React from 'react'

const NEAR_METHODS_REQUIRING_VISUAL_CONFIRMATION: readonly NearSigningMethod[] =
  [
    NearSigningMethod.NEAR_SIGN_IN,
    NearSigningMethod.NEAR_SIGN_OUT,
    NearSigningMethod.NEAR_SIGN_TRANSACTION,
    NearSigningMethod.NEAR_SIGN_AND_SEND_TRANSACTION,
    NearSigningMethod.NEAR_SIGN_TRANSACTIONS,
    NearSigningMethod.NEAR_SIGN_AND_SEND_TRANSACTIONS,
  ]

export const useWalletConnectSessionRequestCallbackNear = (): ((
  params: WalletConnectSessionRequestCallbackParams
) => Promise<void>) => {
  const { nearNetwork: nearNetworkId, keystore } = useNearContext()
  const { showModal } = useModal()

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

      const provider = new providers.JsonRpcProvider(rpc)

      if (NEAR_METHODS_REQUIRING_VISUAL_CONFIRMATION.includes(method))
        return showModal(
          <WalletConnectTransactionRequestModal
            provider={provider}
            web3wallet={web3wallet}
            request={request}
          />
        )

      const { [method]: handle } = nearSessionRequestHandlers

      return resolveSessionRequest({
        request,
        web3wallet,
        result: handle({ web3wallet, request, provider }),
      })
    },
    [keystore, nearNetworkId, nearSessionRequestHandlers, showModal]
  )
}
