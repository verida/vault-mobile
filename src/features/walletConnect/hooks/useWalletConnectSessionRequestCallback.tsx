import { IWeb3Wallet } from '@walletconnect/web3wallet'
import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/types/client'
import { ActiveSessions } from 'features/walletConnect'
import { useModal } from 'hooks'
import * as React from 'react'

import { WalletConnectTransactionRequestModal } from '../components/WalletConnect.Transaction.Request.Modal'
import {
  extractWalletConnectRpcOrThrow,
  isWalletConnectRequestRequiresVisualConfirmation,
} from '../utils'
import { useWalletConnectSessionApproveCallback } from './useWalletConnectSessionApproveCallback'
import { useWalletConnectSessionRejectCallback } from './useWalletConnectSessionRejectCallback'

// Acts as a multiplexer for WalletConnect session requests. It determines which
// network to dispatch the request to.
export const useWalletConnectSessionRequestCallback = (): ((
  web3wallet: IWeb3Wallet,
  event: Web3WalletTypes.EventArguments['session_request']
) => void) => {
  const { showModal } = useModal()

  const approve = useWalletConnectSessionApproveCallback()
  const reject = useWalletConnectSessionRejectCallback()

  return React.useCallback(
    async (
      web3wallet: IWeb3Wallet,
      request: Web3WalletTypes.EventArguments['session_request']
    ): Promise<void> => {
      try {
        const { rpc } = extractWalletConnectRpcOrThrow(web3wallet, request)

        if (isWalletConnectRequestRequiresVisualConfirmation(request)) {
          const { topic } = request

          const activeSessions: ActiveSessions =
            await web3wallet.getActiveSessions()

          const { [topic]: maybeActiveSession } = activeSessions

          if (!maybeActiveSession)
            throw new Error(
              `Unable to find activeSession for topic "${topic}".`
            )

          return showModal(
            <WalletConnectTransactionRequestModal
              web3wallet={web3wallet}
              request={request}
              rpc={rpc}
              activeSession={maybeActiveSession}
            />
          )
        }

        return approve(web3wallet, request)
      } catch (e) {
        return reject(web3wallet, request, e)
      }
    },
    [approve, reject, showModal]
  )
}
