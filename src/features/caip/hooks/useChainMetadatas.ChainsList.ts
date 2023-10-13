import { ChainId } from 'caip'
import { ChainMetadatas, isSupportedCaipNamespace } from 'features/caip'
import { cryptoWalletApi } from 'features/cryptoWallet'
import * as React from 'react'

import { BlockchainNetwork } from 'api/types'
import { config } from 'config/environment'

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

  const { label: name, rpcUrl } = blockchainNetwork

  const rpc = rpcUrl.replace(/%INFURA_KEY%/g, config.INFURA_API_KEY)

  return {
    namespace,
    reference,
    name,
    rpc,
  }
}

const defaultResult: ChainMetadatas = Object.freeze({})

export function getMaybeChainMetadatas(
  state: UseChainMetadataState
): ChainMetadatas {
  if (!('result' in state) || !state.result) return defaultResult

  return state.result
}

export function getMaybeChainMetadatasError(
  state: UseChainMetadataState
): Error | undefined {
  if (!('error' in state)) return undefined

  return state.error
}

// Transforms the ChainsList into executable provider configuration by WalletConnect.
export function useChainMetadatasChainsList(): UseChainMetadataState {
  // Returns chains which are sanctioned by the backend.
  const {
    data,
    error: cause,
    isLoading: isLoadingChainsList,
  } = useChainsListQuery({})

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

    const result: Record<string, ChainMetadata> = Object.fromEntries(
      Object.entries(data)
        .map(
          ([maybeSupportedCaip, blockchainNetwork]):
            | [caipIdentifier: string, chainMetadata: ChainMetadata]
            | undefined => {
            const caipChainId = new ChainId(maybeSupportedCaip)

            const { namespace } = caipChainId

            if (!isSupportedCaipNamespace(namespace)) return undefined

            const maybeChainMetadata =
              maybeBlockchainNetworkEntryToChainMetadata({
                blockchainNetwork,
                caipChainId,
              })

            if (!maybeChainMetadata) return undefined

            return [caipChainId.toString(), maybeChainMetadata]
          }
        )
        .flatMap((e) => (e ? [e] : []))
    )

    return { loading: false, result }
  }, [isLoadingChainsList, cause, data])
}
