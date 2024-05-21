import * as React from 'react'

import {
  useWalletConnectSessionApproveCallback,
  useWalletConnectSessionRejectCallback,
} from '../hooks'
import {
  ActiveSession,
  WalletConnectSessionRequestCallbackParams,
} from '../types'
import { WalletConnectTransactionRequestModalAdapter } from './WalletConnect.Transaction.Request.Modal.Adapter'

export const WalletConnectTransactionRequestModal = React.memo(
  function WalletConnectTransactionRequestModal({
    web3wallet,
    request,
    activeSession,
  }: WalletConnectSessionRequestCallbackParams & {
    readonly activeSession: ActiveSession
  }): JSX.Element {
    const peerMetadata = activeSession?.peer?.metadata

    const maybeProtocol = activeSession?.relay?.protocol

    const relayProtocols = React.useMemo<readonly string[]>(
      () =>
        typeof maybeProtocol === 'string' && maybeProtocol.length
          ? [maybeProtocol]
          : [],
      [maybeProtocol]
    )

    const shouldApprove = useWalletConnectSessionApproveCallback()
    const shouldReject = useWalletConnectSessionRejectCallback()

    const onRequestApprove = React.useCallback(
      () => shouldApprove(web3wallet, request),
      [request, shouldApprove, web3wallet]
    )

    const onRequestReject = React.useCallback(
      async () =>
        shouldReject(web3wallet, request, 'User rejected the request', false),
      [request, shouldReject, web3wallet]
    )

    return (
      <WalletConnectTransactionRequestModalAdapter
        peerMetadata={peerMetadata}
        relayProtocols={relayProtocols}
        request={request}
        onRequestApprove={onRequestApprove}
        onRequestReject={onRequestReject}
      />
    )
  }
)
