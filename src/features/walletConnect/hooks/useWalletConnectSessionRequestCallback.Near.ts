import { IWeb3Wallet } from '@walletconnect/web3wallet'
import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/types/client'
import {
  getNearAccountsForPublicKey,
  throwIfInvalidNearSigningMethod,
  useNearContext,
} from 'features/near'
import { useSessionRequestHandlersNear } from 'features/walletConnect'
import * as React from 'react'

export const useWalletConnectSessionRequestCallbackNear = (): ((
  web3wallet: IWeb3Wallet,
  event: Web3WalletTypes.EventArguments['session_request']
) => Promise<void>) => {
  const { maybeNearWalletInstance } = useNearContext()
  const nearSessionRequestHandlers = useSessionRequestHandlersNear()
  return React.useCallback(
    async (
      web3wallet: IWeb3Wallet,
      event: Web3WalletTypes.EventArguments['session_request']
    ) => {
      if (!maybeNearWalletInstance)
        throw new Error(
          `Unable to handle session_request for Near blockchain - the wallet instance was unavailable.`
        )

      const nearAccounts = await getNearAccountsForPublicKey(
        maybeNearWalletInstance
      )

      const maybeNearAccount = nearAccounts.filter(
        (e) => e.publicKey === event.topic
      )

      if (!maybeNearAccount)
        throw new Error(
          `Unable to find matching Near account for "${event.topic}".`
        )

      const method = event?.params?.request?.method

      if (!throwIfInvalidNearSigningMethod(method)) return

      const { [method]: handle } = nearSessionRequestHandlers

      // TODO: handle T for result
      return handle(web3wallet, event)
    },
    [maybeNearWalletInstance, nearSessionRequestHandlers]
  )
}
