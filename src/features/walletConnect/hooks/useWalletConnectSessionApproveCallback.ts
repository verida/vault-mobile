import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { stringifyCaip } from 'features/caip'
import * as React from 'react'

import { WalletConnectChainStyle } from '../@types'
import {
  extractWalletConnectRpcOrThrow,
  getMaybeWalletConnectConfigForChainId,
  resolveSessionRequest,
} from '../utils'
import { useWalletConnectSessionApproveCallbackEthereumLike } from './useWalletConnectSessionApproveCallback.EthereumLike'
import { useWalletConnectSessionApproveCallbackNearLike } from './useWalletConnectSessionApproveCallback.NearLike'

export function useWalletConnectSessionApproveCallback() {
  const ethereumLikeApprove =
    useWalletConnectSessionApproveCallbackEthereumLike()
  const nearLikeApprove = useWalletConnectSessionApproveCallbackNearLike()

  const chainSpecificApproveOrThrow = React.useCallback(
    (
      web3wallet: IWeb3Wallet,
      request: Web3WalletTypes.EventArguments['session_request']
    ) => {
      const { rpc, parsedCaipType } = extractWalletConnectRpcOrThrow(
        web3wallet,
        request
      )

      const maybeWalletConnectConfig =
        getMaybeWalletConnectConfigForChainId(parsedCaipType)

      if (!maybeWalletConnectConfig)
        throw new Error(
          `Unable to find walletConnectConfig for "${stringifyCaip({
            parsedCaipType,
            suppressAddressComponent: true,
          })}".`
        )

      const { style } = maybeWalletConnectConfig

      // TODO: Make this static compilation error

      if (style === WalletConnectChainStyle.EVM_LIKE)
        return ethereumLikeApprove({ web3wallet, request, rpc })

      if (style === WalletConnectChainStyle.NEAR_LIKE)
        return nearLikeApprove({ web3wallet, request, rpc })

      throw new Error(
        `Sorry, ${stringifyCaip({
          parsedCaipType,
          suppressAddressComponent: true,
        })} is not supported.`
      )
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
