import { ChainId } from 'caip'
import { ChainMetadatas, isSupportedCaipNamespace } from 'features/caip'
import { walletsApi } from 'features/cryptoWallet'
import * as React from 'react'
import Config from 'react-native-config'

import { BlockchainNetwork } from 'api/types'

import { ChainMetadata } from '../@types'

const { INFURA_API_KEY } = Config

const { useChainsListQuery } = walletsApi

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

  const { label: name, rpcUrl: rpc } = blockchainNetwork

  return {
    namespace,
    reference,
    name,
    rpc: rpc.replaceAll('%INFURA_KEY%', INFURA_API_KEY),

    // TODO: fix this lookup - use real images and colors
    logo: '/chain-logos/eip155-43113.png',
    rgb: '232, 65, 66',
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
        // @ts-expect-error language_version
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
