import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils'
import { IWeb3Wallet } from '@walletconnect/web3wallet'
import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/types/client'
import { rejectSessionRequest } from 'features/walletConnect'
import * as React from 'react'

// Acts as a multiplexer for WalletConnect session requests. It determines which
// network to dispatch the request to.
export const useWalletConnectSessionRequestCallback = (): ((
  web3wallet: IWeb3Wallet,
  event: Web3WalletTypes.EventArguments['session_request']
) => void) =>
  React.useCallback(
    async (
      web3wallet: IWeb3Wallet,
      request: Web3WalletTypes.EventArguments['session_request']
    ) => {
      const maybeChainId = request?.params?.chainId

      // TODO: relate network to chain
      if (maybeChainId === 'ethereum') {
        return
      } else if (maybeChainId === 'near') {
        return
      }

      return rejectSessionRequest({
        web3wallet,
        request,
        reason: `Encountered unexpected chainId, "${maybeChainId}".`,
      })
    },
    []
  )
