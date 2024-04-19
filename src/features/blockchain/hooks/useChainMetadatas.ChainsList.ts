import { ChainId } from 'caip'
import { config } from 'config'
import * as React from 'react'

import { useGetBlockchainNetworksQuery } from '../redux'
import { BlockchainExplorerUrlSchema } from '../schemas'
import {
  Blockchain,
  BlockchainExplorer,
  LegacyBlockchain,
  UseChainMetadataState,
} from '../types'
import { isSupportedBlockchainNamespace } from '../utils'

const maybeBlockchainNetworkEntryToChainMetadata = ({
  blockchainNetwork,
  caipChainId,
}: {
  readonly blockchainNetwork: LegacyBlockchain
  readonly caipChainId: ChainId
}): Blockchain | undefined => {
  const { namespace, reference } = caipChainId

  if (!isSupportedBlockchainNamespace(namespace)) {
    return undefined
  }

  const {
    rpcUrl,
    symbol,
    decimal: decimals,
    label,
    icon,
    explorerURL: maybeExplorerUrl,
    isMainnet,
  } = blockchainNetwork

  const rpc = rpcUrl.replace(/%INFURA_KEY%/g, config.blockchain.infuraApiKey)

  const explorerURLResult =
    BlockchainExplorerUrlSchema.safeParse(maybeExplorerUrl)

  const blockExplorers: BlockchainExplorer[] = explorerURLResult.success
    ? [{ url: explorerURLResult.data }]
    : []

  return {
    namespace,
    reference,
    name: label,
    rpcUrls: [rpc],
    symbol,
    decimals,
    nativeCurrencyName: symbol,
    icon,
    blockExplorers,
    isMainnet,
  }
}

const DEFAULT_CHAIN_LIST_QUERY = Object.freeze({})

export function getMaybeChainMetadatas(
  state: UseChainMetadataState
): Blockchain[] {
  if (!('result' in state) || !state.result) {
    return []
  }

  return state.result
}

export function getMaybeChainMetadatasError(
  state: UseChainMetadataState
): Error | undefined {
  if (!('error' in state)) {
    return undefined
  }

  return state.error
}

// Returns a stateful list of ChainMetadatas which are served by the Verida backend.
export function useChainMetadatasChainsList(): UseChainMetadataState {
  const {
    data,
    error: cause,
    isLoading: isLoadingChainsList,
  } = useGetBlockchainNetworksQuery(DEFAULT_CHAIN_LIST_QUERY)

  return React.useMemo<UseChainMetadataState>(() => {
    if (isLoadingChainsList) {
      return { loading: true }
    }

    if (cause) {
      return {
        loading: false,
        error: new Error('Failed to fetch ChainsList.', { cause }),
      }
    }

    if (!data || !Object.keys(data).length) {
      return {
        loading: false,
        error: new Error(
          `The walletsApi has not returned any BlockchainNetworks.`
        ),
      }
    }

    const result: Blockchain[] = Object.entries(data)
      .map(
        ([maybeSupportedCaip, blockchainNetwork]): Blockchain | undefined => {
          const caipChainId = new ChainId(maybeSupportedCaip)

          const { namespace } = caipChainId

          if (!isSupportedBlockchainNamespace(namespace)) {
            return undefined
          }

          const maybeChainMetadata = maybeBlockchainNetworkEntryToChainMetadata(
            {
              blockchainNetwork,
              caipChainId,
            }
          )

          if (!maybeChainMetadata) {
            return undefined
          }

          return maybeChainMetadata
        }
      )
      .flatMap((e) => (e ? [e] : []))

    return { loading: false, result }
  }, [isLoadingChainsList, cause, data])
}
