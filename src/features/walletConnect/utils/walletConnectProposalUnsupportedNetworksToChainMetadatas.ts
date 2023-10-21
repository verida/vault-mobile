import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/index'
import { ChainId, ChainIdParams } from 'caip'
import { ChainsList, ChainsListItem } from 'features/blockchain/eip155'
import {
  ChainMetadata,
  ChainMetadataRpcs,
  ChainMetadatas,
  SupportedCaipNamespace,
} from 'features/caip/@types'
import { isSupportedCaipNamespace } from 'features/caip/utils/isSupportedCaipNamespace'

// WalletConnect proposals may optionally define rpcUrls for the connecting
// DApp, which may be used if the DApp has never encountered the chain before.
const extractMaybeRpcForCurrentlyUnsupportedChainIdFromProposal = ({
  proposal,
  namespace,
  reference,
}: ChainIdParams & {
  readonly proposal: Web3WalletTypes.EventArguments['session_proposal']
}): string | undefined => {
  const maybeRequiredNamespace =
    proposal?.params?.requiredNamespaces?.[namespace]

  if (!maybeRequiredNamespace) return undefined

  const maybeRpcMap =
    'rpcMap' in maybeRequiredNamespace
      ? maybeRequiredNamespace.rpcMap
      : undefined

  // TODO: where do we replace infura id?????? make runtime DO NOT save in config
  if (!maybeRpcMap || typeof maybeRpcMap !== 'object') return undefined

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const maybeRpc = maybeRpcMap?.[reference]

  if (typeof maybeRpc !== 'string' || !maybeRpc.length) return undefined

  return maybeRpc
}

const getMaybeRpcsUsingChainsList = ({
  chainsList,
  forChainId: chainId,
}: {
  readonly chainsList: ChainsList
  readonly forChainId: ChainId
}): readonly string[] => {
  const { namespace } = chainId

  // The ChainsList only defines EVM-compatible chains.
  if (namespace !== SupportedCaipNamespace.EIP_155) return []

  const { reference } = chainId

  const maybeChainsListItem: ChainsListItem | undefined = chainsList.find(
    (e) => e.chainId === parseInt(reference, 10)
  )

  if (!maybeChainsListItem) return []

  const { rpc } = maybeChainsListItem

  return rpc
}

// Attempts to create a corresponding ChainMetadata for each element of `currentlyUnsupportedChainIds`
// based upon the content of the provided WalletConnect proposal. If a ChainMetadata cannot be successfully,
// a corresponding entry of the result array will be missing.
export const walletConnectProposalUnsupportedNetworksToChainMetadatas = ({
  chainsList,
  currentlyUnsupportedChainIds,
  proposal,
}: {
  readonly chainsList: ChainsList
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

      const maybeRpc =
        extractMaybeRpcForCurrentlyUnsupportedChainIdFromProposal({
          ...chainId,
          proposal,
        })

      const maybeRpcFromChainsList = getMaybeRpcsUsingChainsList({
        chainsList,
        forChainId: chainId,
      })

      if (!maybeRpc && !maybeRpcFromChainsList.length) return []

      // TODO: use an array instead

      const maybeRpcUrls = ChainMetadataRpcs.safeParse(
        maybeRpc ? [maybeRpc] : maybeRpcFromChainsList
      )

      if (!maybeRpcUrls.success) return []

      const chainMetadata: ChainMetadata = {
        namespace,
        reference,
        // TODO: programmatically find the name, i.e. 4byte directory
        name: currentlyUnsupportedChainId.toString(),
        rpcUrls: maybeRpcUrls.data,
      }

      return [chainMetadata]
    }
  )
}
