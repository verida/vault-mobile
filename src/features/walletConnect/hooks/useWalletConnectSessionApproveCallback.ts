import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import {
  getChainMetadataByCaipTypeOrThrow,
  getMaybeChainMetadatas,
  stringifyCaip,
  SupportedCaipProtocolStandard,
  useChainMetadatas,
} from 'features/caip'
import * as React from 'react'

import { SupportedCaipProtocolSessionHandlers } from '../@types'
import { extractWalletConnectRpcOrThrow, resolveSessionRequest } from '../utils'
import { useWalletConnectSessionApproveCallbackEthereumLike } from './useWalletConnectSessionApproveCallback.EthereumLike'
import { useWalletConnectSessionApproveCallbackNearLike } from './useWalletConnectSessionApproveCallback.NearLike'

export function useWalletConnectSessionApproveCallback() {
  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  const ethereumLikeApprove =
    useWalletConnectSessionApproveCallbackEthereumLike()
  const nearLikeApprove = useWalletConnectSessionApproveCallbackNearLike()

  // For each supported protocol, a corresponding handler implementation *must* be provided.
  const supportedStandardHandlers: SupportedCaipProtocolSessionHandlers =
    React.useMemo(
      () => ({
        [SupportedCaipProtocolStandard.EIP_155]: ethereumLikeApprove,
        [SupportedCaipProtocolStandard.NEAR]: nearLikeApprove,
      }),
      [ethereumLikeApprove, nearLikeApprove]
    )

  const chainSpecificApproveOrThrow = React.useCallback(
    (
      web3wallet: IWeb3Wallet,
      request: Web3WalletTypes.EventArguments['session_request']
    ) => {
      const { rpc, parsedCaipType } = extractWalletConnectRpcOrThrow({
        chainMetadatas,
        request,
      })

      const chainMetadata = getChainMetadataByCaipTypeOrThrow(
        chainMetadatas,
        parsedCaipType
      )

      if (!chainMetadata)
        throw new Error(
          `Unable to find ChainMetadata for "${stringifyCaip({
            parsedCaipType,
            suppressAddressComponent: true,
          })}".`
        )

      const { standard } = chainMetadata

      const { [standard]: maybeStandardHandler } = supportedStandardHandlers

      if (!maybeStandardHandler)
        throw new Error(
          `Sorry, ${stringifyCaip({
            parsedCaipType,
            suppressAddressComponent: true,
          })} is not supported.`
        )

      return maybeStandardHandler({ web3wallet, request, rpc })
    },
    [chainMetadatas, supportedStandardHandlers]
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
