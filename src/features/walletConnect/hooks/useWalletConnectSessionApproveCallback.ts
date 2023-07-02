import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import {
  extractWalletConnectRpcOrThrow,
  resolveSessionRequest,
  useWalletConnectSessionRequestApproveCallbackEthereum,
  useWalletConnectSessionRequestApproveCallbackNear,
} from 'features/walletConnect'
import * as React from 'react'

// TODO: make sure wherever we call we are handling with reject
export function useWalletConnectSessionApproveCallback() {
  const ethereumApprove =
    useWalletConnectSessionRequestApproveCallbackEthereum()
  const nearApprove = useWalletConnectSessionRequestApproveCallbackNear()

  const chainSpecificApproveOrThrow = React.useCallback(
    (
      web3wallet: IWeb3Wallet,
      request: Web3WalletTypes.EventArguments['session_request']
    ) => {
      const { rpc, chainId } = extractWalletConnectRpcOrThrow(
        web3wallet,
        request
      )

      // TODO: @cawfree We don't know what these are yet.
      if (chainId === 'ethereum')
        return ethereumApprove({ web3wallet, request, rpc })

      if (chainId === 'near') return nearApprove({ web3wallet, request, rpc })

      throw new Error(`Sorry, ${chainId} is not supported.`)
    },
    [ethereumApprove, nearApprove]
  )

  return React.useCallback(
    async (
      web3wallet: IWeb3Wallet,
      request: Web3WalletTypes.EventArguments['session_request']
    ) =>
      resolveSessionRequest({
        request,
        web3wallet,
        result: await chainSpecificApproveOrThrow(web3wallet, request),
      }),
    [chainSpecificApproveOrThrow]
  )
}
