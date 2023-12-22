import { ChainId } from 'caip'
import { config } from 'config'
import { ChainMetadatas, isSupportedCaipNamespace } from 'features/caip'
import { cryptoWalletApi } from 'features/cryptoWallet'
import * as React from 'react'

import { BlockchainNetwork } from 'api/types'

import { ChainMetadata } from '../@types'

const { useChainsListQuery } = cryptoWalletApi

type State = Readonly<
  | { loading: true }
  | {
      loading: false
      result: ChainMetadatas
    }
  | { loading: false; error: Error }
>

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

  const rpc = rpcUrl.replace(/%INFURA_KEY%/g, config.blockchain.infuraApiKey)

  return {
    namespace,
    reference,
    name,
    rpc,
  }
}

const defaultResult: ChainMetadatas = Object.freeze({})

export function getMaybeChainMetadatas(state: State): ChainMetadatas {
  if (state.loading || !('result' in state)) return defaultResult

  return state.result
}

// Transforms the ChainsList into executable provider configuration by WalletConnect.
export function useChainMetadatas(): State {
  const { data, error: cause, isLoading } = useChainsListQuery({})

  return React.useMemo<State>(() => {
    if (isLoading) return { loading: true }

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
  }, [data, cause, isLoading])
}
