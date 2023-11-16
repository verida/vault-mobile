import { IWeb3Wallet } from '@walletconnect/web3wallet'
import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/types/client'
import { getMaybeChainMetadatas, useChainMetadatas } from 'features/caip'
import { ActiveSessions } from 'features/walletConnect'
import { useModal } from 'hooks'
import * as React from 'react'

import { useAuth } from 'hooks/useAuth'

import { WalletConnectTransactionRequestModal } from '../components/WalletConnect.Transaction.Request.Modal'
import { extractWalletConnectRpcOrThrow } from '../utils'
import { useWalletConnectSessionRejectCallback } from './useWalletConnectSessionRejectCallback'

// Acts as a multiplexer for WalletConnect session requests. It determines which
// network to dispatch the request to.
export const useWalletConnectSessionRequestCallback = (): ((
  web3wallet: IWeb3Wallet,
  event: Web3WalletTypes.EventArguments['session_request']
) => void) => {
  const { showModal } = useModal()
  const { authenticated } = useAuth()

  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

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

        const { rpc } = extractWalletConnectRpcOrThrow({
          request,
          chainMetadatas,
        })

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
            rpc={rpc}
            activeSession={maybeActiveSession}
          />
        )
      } catch (error) {
        return reject(web3wallet, request, error)
      }
    },
    [chainMetadatas, reject, showModal, authenticated]
  )
}
