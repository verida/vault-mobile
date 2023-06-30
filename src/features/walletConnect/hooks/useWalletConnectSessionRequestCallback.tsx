import { IWeb3Wallet } from '@walletconnect/web3wallet'
import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/types/client'
import {
  rejectSessionRequest,
  useWalletConnectSessionRequestCallbackEthereum,
  useWalletConnectSessionRequestCallbackNear,
} from 'features/walletConnect'
import * as React from 'react'

// Acts as a multiplexer for WalletConnect session requests. It determines which
// network to dispatch the request to.
export const useWalletConnectSessionRequestCallback = (): ((
  web3wallet: IWeb3Wallet,
  event: Web3WalletTypes.EventArguments['session_request']
) => void) => {
  const ethereum = useWalletConnectSessionRequestCallbackEthereum()
  const near = useWalletConnectSessionRequestCallbackNear()

  return React.useCallback(
    async (
      web3wallet: IWeb3Wallet,
      request: Web3WalletTypes.EventArguments['session_request']
    ) => {
      const maybeChainId = request?.params?.chainId

      // TODO: @cawfree We don't know what these are yet.
      if (maybeChainId === 'ethereum') return ethereum(web3wallet, request)

      // TODO: @cawfree We don't know what these are yet.
      if (maybeChainId === 'near') return near(web3wallet, request)

      return rejectSessionRequest({
        web3wallet,
        request,
        reason: `Encountered unexpected chainId, "${maybeChainId}".`,
      })
    },
    [ethereum, near]
  )
}
