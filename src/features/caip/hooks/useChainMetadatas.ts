import {
  ChainMetadatas,
  isSupportedCaipStandard,
  maybeParseCaip,
  stringifyCaip,
} from 'features/caip'
import { walletsApi } from 'features/cryptoWallet'
import * as React from 'react'
import Config from 'react-native-config'

import { BlockchainNetwork } from 'api/types'

import {
  ChainMetadata,
  ParsedCaipType,
  SupportedCaipProtocolStandard,
} from '../@types'

// TODO: Use environment variables
const { INFURA_API_KEY = '6e4bf0201647493e93c9eea13b70bd4d' } = Config

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
  parsedCaipType,
}: {
  readonly blockchainNetwork: BlockchainNetwork
  readonly parsedCaipType: ParsedCaipType
}): ChainMetadata<SupportedCaipProtocolStandard> | undefined => {
  const { standard, chainId } = parsedCaipType

  if (!isSupportedCaipStandard(standard)) return undefined

  const { label: name, rpcUrl: rpc } = blockchainNetwork

  return {
    standard,
    chainId,
    name,
    rpc: rpc.replaceAll('%INFURA_KEY%', INFURA_API_KEY),

    // TODO: fix this lookup
    logo: '/chain-logos/eip155-43113.png',
    rgb: '232, 65, 66',
  }
}

export function getMaybeChainMetadatas(state: State): ChainMetadatas {
  if (state.loading || !('result' in state)) return {}

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

    const result: Record<
      string,
      ChainMetadata<SupportedCaipProtocolStandard>
    > = Object.fromEntries(
      Object.entries(data)
        .map(
          ([maybeSupportedCaip, blockchainNetwork]):
            | [
                caipIdentifier: string,
                chainMetadata: ChainMetadata<SupportedCaipProtocolStandard>
              ]
            | undefined => {
            const maybeParsedCaipType = maybeParseCaip(maybeSupportedCaip)

            if (!maybeParsedCaipType) return undefined

            const { standard } = maybeParsedCaipType

            if (!isSupportedCaipStandard(standard)) return undefined

            const maybeChainMetadata =
              maybeBlockchainNetworkEntryToChainMetadata({
                blockchainNetwork,
                parsedCaipType: maybeParsedCaipType,
              })

            if (!maybeChainMetadata) return undefined

            return [
              stringifyCaip({
                parsedCaipType: maybeParsedCaipType,
                suppressAddressComponent: true,
              }),
              maybeChainMetadata,
            ]
          }
        )
        .flatMap((e) => (e ? [e] : []))
    )

    return { loading: false, result }
  }, [data, cause, isLoading])
}
