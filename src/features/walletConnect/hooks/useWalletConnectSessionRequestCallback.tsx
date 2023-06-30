import { IWeb3Wallet } from '@walletconnect/web3wallet'
import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/types/client'
import {
  getMaybeWalletConnectRpcUriForChainId,
  rejectSessionRequest,
  useWalletConnectSessionRequestCallbackEthereum,
  useWalletConnectSessionRequestCallbackNear,
} from 'features/walletConnect'
import * as React from 'react'
import { Alert } from 'react-native'

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

      try {
        // TODO: This can become polygon. Enumerate supported chains accordingly.
        // TODO: @cawfree We don't know what these are yet.
        if (maybeChainId !== 'ethereum' && maybeChainId !== 'near')
          throw new Error(`Encountered unexpected chainId, "${maybeChainId}".`)

        const rpc = getMaybeWalletConnectRpcUriForChainId(maybeChainId)

        if (typeof rpc !== 'string' || !rpc.length)
          throw new Error(
            `Expected non-empty string rpc, encountered "${rpc}".`
          )

        if (maybeChainId === 'ethereum') {
          // TODO: rename to evm like
          await ethereum({ web3wallet, request, rpc })
          // TODO: @cawfree We don't know what these are yet.
        } else if (maybeChainId === 'near') {
          await near({ web3wallet, request, rpc })
        }
      } catch (e) {
        const reason = e instanceof Error ? e.message : String(e)

        Alert.alert('Error', reason)

        return rejectSessionRequest({
          web3wallet,
          request,
          reason,
        })
      }
    },
    [ethereum, near]
  )
}
