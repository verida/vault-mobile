import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import * as React from 'react'

import {
  getMaybeChainMetadatas,
  useChainMetadatas,
} from '~/features/blockchain'
import { SupportedBlockchainNamespace } from '~/features/blockchain/types/enums'
import {
  getChainMetadataByCaipTypeOrThrow,
  isSupportedCaipNamespace,
} from '~/features/caip'

import { SupportedCaipProtocolSessionHandlers } from '../types'
import {
  extractWalletConnectChainIdOrThrow,
  resolveSessionRequest,
} from '../utils'
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
        [SupportedBlockchainNamespace.EIP_155]: eip155Approve,
        [SupportedBlockchainNamespace.NEAR]: nearApprove,
      }),
      [eip155Approve, nearApprove]
    )

  const chainSpecificApproveOrThrow = React.useCallback(
    (
      web3wallet: IWeb3Wallet,
      request: Web3WalletTypes.EventArguments['session_request']
    ) => {
      const chainId = extractWalletConnectChainIdOrThrow({ request })

      const chainMetadata = getChainMetadataByCaipTypeOrThrow(
        chainMetadatas,
        chainId
      )

      if (!chainMetadata)
        throw new Error(
          `Unable to find ChainMetadata for "${chainId.toString()}".`
        )

      const { namespace } = chainMetadata

      if (!isSupportedCaipNamespace(namespace))
        throw new Error(`"${namespace}" is not a supported namespace.`)

      const { [namespace]: maybeStandardHandler } = supportedStandardHandlers

      if (!maybeStandardHandler)
        throw new Error(`Sorry, ${chainId.toString()} is not supported.`)

      return maybeStandardHandler({ web3wallet, request })
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
