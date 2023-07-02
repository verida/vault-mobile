import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import {
  extractWalletConnectRpcOrThrow,
  getMaybeWalletConnectConfigForChainId,
  resolveSessionRequest,
  useWalletConnectSessionRequestApproveCallbackEthereumLike,
  useWalletConnectSessionRequestApproveCallbackNearLike,
  WalletConnectChainStyle,
} from 'features/walletConnect'
import * as React from 'react'

export function useWalletConnectSessionApproveCallback() {
  const ethereumLikeApprove =
    useWalletConnectSessionRequestApproveCallbackEthereumLike()
  const nearLikeApprove =
    useWalletConnectSessionRequestApproveCallbackNearLike()

  const chainSpecificApproveOrThrow = React.useCallback(
    (
      web3wallet: IWeb3Wallet,
      request: Web3WalletTypes.EventArguments['session_request']
    ) => {
      const { rpc, chainId } = extractWalletConnectRpcOrThrow(
        web3wallet,
        request
      )

      const maybeWalletConnectConfig =
        getMaybeWalletConnectConfigForChainId(chainId)

      if (!maybeWalletConnectConfig)
        throw new Error(
          `Unable to find walletConnectConfig for chainId "${chainId}".`
        )

      const { style } = maybeWalletConnectConfig

      // TODO: Make this static compilation error

      if (style === WalletConnectChainStyle.EVM_LIKE)
        return ethereumLikeApprove({ web3wallet, request, rpc })

      if (style === WalletConnectChainStyle.NEAR_LIKE)
        return nearLikeApprove({ web3wallet, request, rpc })

      throw new Error(`Sorry, ${chainId} is not supported.`)
    },
    [ethereumLikeApprove, nearLikeApprove]
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
