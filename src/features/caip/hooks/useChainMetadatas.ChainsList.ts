import { ChainId } from 'caip'
import config from 'config'
import { ChainMetadatas, isSupportedCaipNamespace } from 'features/caip'
import { cryptoWalletApi } from 'features/cryptoWallet'
import * as React from 'react'

import { BlockchainNetwork } from 'api/types'

import { ChainMetadata, UseChainMetadataState } from '../@types'

const { useChainsListQuery } = cryptoWalletApi

const maybeBlockchainNetworkEntryToChainMetadata = ({
  blockchainNetwork,
  caipChainId,
}: {
  readonly blockchainNetwork: BlockchainNetwork
  readonly caipChainId: ChainId
}): ChainMetadata | undefined => {
  const { namespace, reference } = caipChainId

  if (!isSupportedCaipNamespace(namespace)) return undefined

  const {
    chainName,
    rpcUrl,
    symbol,
    decimal: decimals,
    label,
    icon,
  } = blockchainNetwork

  const rpc = rpcUrl.replace(/%INFURA_KEY%/g, config.INFURA_API_KEY)

  return {
    namespace,
    reference,
    name: chainName,
    rpcUrls: [rpc],
    symbol,
    decimals,
    nativeCurrencyName: label,
    icon,
  }
}

const DEFAULT_RESULT: ChainMetadatas = Object.freeze([])

const DEFAULT_CHAIN_LIST_QUERY = Object.freeze({})

export function getMaybeChainMetadatas(
  state: UseChainMetadataState
): ChainMetadatas {
  if (!('result' in state) || !state.result) return DEFAULT_RESULT

  return state.result
}

export function getMaybeChainMetadatasError(
  state: UseChainMetadataState
): Error | undefined {
  if (!('error' in state)) return undefined

  return state.error
}

// Returns a stateful list of ChainMetadatas which are served by the Verida backend.
export function useChainMetadatasChainsList(): UseChainMetadataState {
  const {
    data,
    error: cause,
    isLoading: isLoadingChainsList,
  } = useChainsListQuery(DEFAULT_CHAIN_LIST_QUERY)

  return React.useMemo<UseChainMetadataState>(() => {
    if (isLoadingChainsList) return { loading: true }

    if (cause)
      return {
        loading: false,
        error: new Error('Failed to fetch ChainsList.', { cause }),
      }

    if (!data || !Object.keys(data).length)
      return {
        loading: false,
        error: new Error(
          `The walletsApi has not returned any BlockchainNetworks.`
        ),
      }

    const result: ChainMetadatas = Object.entries(data)
      .map(
        ([maybeSupportedCaip, blockchainNetwork]):
          | ChainMetadata
          | undefined => {
          const caipChainId = new ChainId(maybeSupportedCaip)

          const { namespace } = caipChainId

          if (!isSupportedCaipNamespace(namespace)) return undefined

          const maybeChainMetadata = maybeBlockchainNetworkEntryToChainMetadata(
            {
              blockchainNetwork,
              caipChainId,
            }
          )

          if (!maybeChainMetadata) return undefined

          return maybeChainMetadata
        }
      )
      .flatMap((e) => (e ? [e] : []))

    return { loading: false, result }
  }, [isLoadingChainsList, cause, data])
}
