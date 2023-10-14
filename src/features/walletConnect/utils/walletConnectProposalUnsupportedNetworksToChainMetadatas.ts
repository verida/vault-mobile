import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/index'
import { ChainId } from 'caip'
import { ChainMetadata, ChainMetadatas } from 'features/caip/@types'
import { isSupportedCaipNamespace } from 'features/caip/utils/isSupportedCaipNamespace'

// Attempts to create a corresponding ChainMetadata for each element of `currentlyUnsupportedChainIds`
// based upon the content of the provided WalletConnect proposal. If a ChainMetadata cannot be successfully,
// a corresponding entry of the result array will be missing.
export const walletConnectProposalUnsupportedNetworksToChainMetadatas = ({
  currentlyUnsupportedChainIds,
  proposal,
}: {
  readonly currentlyUnsupportedChainIds: readonly ChainId[]
  readonly proposal: Web3WalletTypes.EventArguments['session_proposal']
}): ChainMetadatas => {
  // Constrain assumptions.
  const uniqueChainIds = [
    ...new Set(
      currentlyUnsupportedChainIds.map((currentlyUnsupportedChainId) =>
        currentlyUnsupportedChainId.toString()
      )
    ),
  ]

  if (uniqueChainIds.length !== currentlyUnsupportedChainIds.length)
    throw new Error(
      'Was passed a non-unique list of currentlyUnsupportedChainIds, which is not permitted.'
    )

  return uniqueChainIds.flatMap(
    (currentlyUnsupportedChainId: string): ChainMetadatas => {
      const chainId = new ChainId(currentlyUnsupportedChainId)

      const { namespace, reference } = chainId

      // Do not permit unsupported namespaces.
      if (!isSupportedCaipNamespace(namespace)) return []

      const maybeRequiredNamespace =
        proposal?.params?.requiredNamespaces?.[namespace]

      if (!maybeRequiredNamespace) return []

      const maybeRpcMap =
        'rpcMap' in maybeRequiredNamespace
          ? maybeRequiredNamespace.rpcMap
          : undefined

      if (!maybeRpcMap || typeof maybeRpcMap !== 'object') return []

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const maybeRpc = maybeRpcMap?.[reference]

      if (typeof maybeRpc !== 'string' || !maybeRpc.length) return []

      const chainMetadata: ChainMetadata = {
        namespace,
        reference,
        // TODO: programmatically find the name, i.e. 4byte directory
        name: currentlyUnsupportedChainId.toString(),
        rpc: maybeRpc,
      }

      return [chainMetadata]
    }
  )
}
