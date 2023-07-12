import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import {
  getChainMetadataByCaipTypeOrThrow,
  getMaybeChainMetadatas,
  isSupportedCaipNamespace,
  stringifyCaip,
  SupportedCaipNamespace,
  useChainMetadatas,
} from 'features/caip'
import * as React from 'react'

import { SupportedCaipProtocolSessionHandlers } from '../@types'
import { extractWalletConnectRpcOrThrow, resolveSessionRequest } from '../utils'
import { useWalletConnectSessionApproveCallbackEip155 } from './useWalletConnectSessionApproveCallback.Eip155'
import { useWalletConnectSessionApproveCallbackNear } from './useWalletConnectSessionApproveCallback.Near'

export function useWalletConnectSessionApproveCallback() {
  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  const eip155Approve = useWalletConnectSessionApproveCallbackEip155()
  const nearApprove = useWalletConnectSessionApproveCallbackNear()

  // For each supported protocol, a corresponding handler implementation *must* be provided.
  const supportedStandardHandlers: SupportedCaipProtocolSessionHandlers =
    React.useMemo(
      () => ({
        [SupportedCaipNamespace.EIP_155]: eip155Approve,
        [SupportedCaipNamespace.NEAR]: nearApprove,
      }),
      [eip155Approve, nearApprove]
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

      const { namespace } = chainMetadata

      if (!isSupportedCaipNamespace(namespace))
        throw new Error(`"${namespace}" is not a supported namespace.`)

      const { [namespace]: maybeStandardHandler } = supportedStandardHandlers

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
