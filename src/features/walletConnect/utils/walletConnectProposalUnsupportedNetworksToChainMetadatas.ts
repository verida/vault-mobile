import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/index'
import { ChainId, ChainIdParams } from 'caip'

import { ChainsList, ChainsListItem } from '~/features/blockchain/eip155'
import { BlockchainRpcUrlsSchema } from '~/features/blockchain/schemas'
import {
  Blockchain,
  BlockchainExplorer,
  SupportedBlockchainNamespace,
} from '~/features/blockchain/types' // HACK: Have to use `.../types` path to make the unit tests work, other wise they fail with importing stuff not required for the tests.
// It's either something to fix in the tests or it's a barrel file problem, should we challenge using them?
import { isSupportedBlockchainNamespace } from '~/features/blockchain/utils'

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

  if (!maybeRequiredNamespace) {
    return undefined
  }

  const maybeRpcMap =
    'rpcMap' in maybeRequiredNamespace
      ? maybeRequiredNamespace.rpcMap
      : undefined

  // TODO: where do we replace infura id?????? make runtime DO NOT save in config
  if (!maybeRpcMap || typeof maybeRpcMap !== 'object') {
    return undefined
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const maybeRpc = maybeRpcMap?.[reference]

  if (typeof maybeRpc !== 'string' || !maybeRpc.length) {
    return undefined
  }

  return maybeRpc
}

export const getMaybeChainsListItemByChainsListByChainId = ({
  chainsList,
  forChainId: chainId,
}: {
  readonly chainsList: ChainsList
  readonly forChainId: ChainId
}): ChainsListItem | undefined => {
  const { namespace } = chainId

  // The ChainsList only defines EVM-compatible chains.
  if (namespace !== SupportedBlockchainNamespace.EIP_155) {
    return undefined
  }

  const { reference } = chainId

  return chainsList.find((e) => e.chainId === parseInt(reference, 10))
}

const getMaybeRpcsUsingChainsList = ({
  chainsList,
  forChainId,
}: {
  readonly chainsList: ChainsList
  readonly forChainId: ChainId
}): readonly string[] => {
  const maybeChainsListItem = getMaybeChainsListItemByChainsListByChainId({
    chainsList,
    forChainId,
  })

  if (!maybeChainsListItem) {
    return []
  }

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
}): Blockchain[] => {
  // Constrain assumptions.
  const uniqueChainIds = [
    ...new Set(
      currentlyUnsupportedChainIds.map((currentlyUnsupportedChainId) =>
        currentlyUnsupportedChainId.toString()
      )
    ),
  ]

  if (uniqueChainIds.length !== currentlyUnsupportedChainIds.length) {
    throw new Error(
      'Was passed a non-unique list of currentlyUnsupportedChainIds, which is not permitted.'
    )
  }

  return uniqueChainIds.flatMap(
    (currentlyUnsupportedChainId: string): Blockchain[] => {
      const chainId = new ChainId(currentlyUnsupportedChainId)

      const { namespace, reference } = chainId

      // Do not permit unsupported namespaces.
      if (!isSupportedBlockchainNamespace(namespace)) {
        return []
      }

      const maybeRpc =
        extractMaybeRpcForCurrentlyUnsupportedChainIdFromProposal({
          ...chainId,
          proposal,
        })

      const maybeRpcFromChainsList = getMaybeRpcsUsingChainsList({
        chainsList,
        forChainId: chainId,
      })

      if (!maybeRpc && !maybeRpcFromChainsList.length) {
        return []
      }

      // TODO: use an array instead

      const maybeRpcUrls = BlockchainRpcUrlsSchema.safeParse(
        maybeRpc ? [maybeRpc] : maybeRpcFromChainsList
      )

      if (!maybeRpcUrls.success) {
        return []
      }

      const maybeChainsListItem = getMaybeChainsListItemByChainsListByChainId({
        forChainId: chainId,
        chainsList,
      })

      if (!maybeChainsListItem) {
        return []
      }

      const { nativeCurrency, name, explorers } = maybeChainsListItem
      const { decimals, symbol, name: nativeCurrencyName } = nativeCurrency

      const blockExplorers: BlockchainExplorer[] = explorers ? explorers : []

      const chainMetadata: Blockchain = {
        namespace,
        reference,
        name,
        rpcUrls: maybeRpcUrls.data,
        decimals,
        symbol,
        nativeCurrencyName,
        blockExplorers,

        // TODO: how to determine the icon to use?
        icon: null,
        // TODO: how to determine if testnet or mainnet?
        isMainnet: null,
      }

      return [chainMetadata]
    }
  )
}
