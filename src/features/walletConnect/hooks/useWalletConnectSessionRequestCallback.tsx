import { IWeb3Wallet } from '@walletconnect/web3wallet'
import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/types/client'
import { ActiveSessions, RpcSelector } from 'features/walletConnect'
import { useModal } from 'hooks'
import * as React from 'react'

import { useAuth } from 'hooks/useAuth'

import { WalletConnectTransactionRequestModal } from '../components/WalletConnect.Transaction.Request.Modal'
import { useWalletConnectSessionRejectCallback } from './useWalletConnectSessionRejectCallback'

// Acts as a multiplexer for WalletConnect session requests. It determines which
// network to dispatch the request to.
export const useWalletConnectSessionRequestCallback = ({
  rpcSelector,
}: {
  readonly rpcSelector: RpcSelector
}): ((
  web3wallet: IWeb3Wallet,
  event: Web3WalletTypes.EventArguments['session_request']
) => void) => {
  const { showModal } = useModal()
  const { authenticated } = useAuth()

  // We could also optionally automatically approve calls here if needed:
  //const approve = useWalletConnectSessionApproveCallback()
  const reject = useWalletConnectSessionRejectCallback()

  return React.useCallback(
    async (
      web3wallet: IWeb3Wallet,
      request: Web3WalletTypes.EventArguments['session_request']
    ): Promise<void> => {
      try {
        // If the user hasn't authenticated the app, then don't do anything.
        if (!authenticated)
          return reject(
            web3wallet,
            request,
            new Error('Not authenticated.'),
            false
          )

        const { topic } = request

        const activeSessions: ActiveSessions =
          await web3wallet.getActiveSessions()

        const { [topic]: maybeActiveSession } = activeSessions

        if (!maybeActiveSession)
          throw new Error(`Unable to find activeSession for topic "${topic}".`)

        return showModal(
          <WalletConnectTransactionRequestModal
            web3wallet={web3wallet}
            request={request}
            rpcSelector={rpcSelector}
            activeSession={maybeActiveSession}
          />
        )
      } catch (e) {
        return reject(web3wallet, request, e)
      }
    },
    [reject, showModal, authenticated, rpcSelector]
  )
}
