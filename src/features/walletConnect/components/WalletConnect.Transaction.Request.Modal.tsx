import * as React from 'react'

import {
  ActiveSession,
  RpcSelector,
  WalletConnectSessionRequestCallbackParams,
} from '../@types'
import {
  useWalletConnectSessionApproveCallback,
  useWalletConnectSessionRejectCallback,
} from '../hooks'
import { WalletConnectTransactionRequestModalAdapter } from './WalletConnect.Transaction.Request.Modal.Adapter'

export const WalletConnectTransactionRequestModal = React.memo(
  function WalletConnectTransactionRequestModal({
    web3wallet,
    request,
    activeSession,
    rpcSelector,
  }: WalletConnectSessionRequestCallbackParams & {
    readonly activeSession: ActiveSession
    readonly rpcSelector: RpcSelector
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

    const shouldApprove = useWalletConnectSessionApproveCallback({
      rpcSelector,
    })
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
