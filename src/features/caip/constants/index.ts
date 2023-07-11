import Config from 'react-native-config'

import {
  ChainMetadata,
  ParsedCaipType,
  SupportedCaipProtocolStandard,
} from '../@types'
import { stringifyCaip } from '../utils/stringifyCaip'

// TODO: Use environment variables
const { INFURA_API_KEY = '6e4bf0201647493e93c9eea13b70bd4d' } = Config

// TODO: It is not ideal to work this way (knowing a specific chainId), however
//       the implementation of Near protocol demands we do this for when we generate
//       NEAR metadata URLs.
export const NEAR_TESTNET_CAIP: ParsedCaipType<SupportedCaipProtocolStandard.NEAR> =
  {
    address: undefined,
    standard: SupportedCaipProtocolStandard.NEAR,
    chainId: 'testnet',
  }

// For now, treat as the single source of truth for chain information - evaluate all metadata from here.
const ethereumGoerli: ChainMetadata<SupportedCaipProtocolStandard.EIP_155> = {
  standard: SupportedCaipProtocolStandard.EIP_155,
  chainId: '5',
  name: 'Ethereum Goerli',
  logo: '/chain-logos/eip155-1.png',
  rgb: '99, 125, 234',
  rpc: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
}

const polygonMumbai: ChainMetadata<SupportedCaipProtocolStandard.EIP_155> = {
  standard: SupportedCaipProtocolStandard.EIP_155,
  chainId: '80001',
  name: 'Polygon Mumbai',
  logo: '/chain-logos/eip155-137.png',
  rgb: '130, 71, 229',
  // TODO: Is this correct?
  rpc: `https://polygon-mumbai.infura.io/v3/${INFURA_API_KEY}`,
}

const optimismGoerli: ChainMetadata<SupportedCaipProtocolStandard.EIP_155> = {
  standard: SupportedCaipProtocolStandard.EIP_155,
  chainId: '420',
  name: 'Optimism Goerli',
  logo: '/chain-logos/eip155-10.png',
  rgb: '235, 0, 25',
  rpc: 'https://goerli.optimism.io',
}

const avalancheFuji: ChainMetadata<SupportedCaipProtocolStandard.EIP_155> = {
  standard: SupportedCaipProtocolStandard.EIP_155,
  chainId: '43113',
  name: 'Avalanche Fuji',
  logo: '/chain-logos/eip155-43113.png',
  rgb: '232, 65, 66',
  rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
}

const nearTestnet: ChainMetadata<SupportedCaipProtocolStandard.NEAR> = {
  ...NEAR_TESTNET_CAIP,
  name: 'NEAR Testnet',
  logo: '/chain-logos/near.png',
  rgb: '99, 125, 234',
  rpc: 'https://rpc.testnet.near.org',
}

// TODO: Load this dynamically from user config to allow end users to customize
//       chains they'd like to use.
export const SUPPORTED_CHAINS: Record<
  string,
  ChainMetadata<SupportedCaipProtocolStandard>
> = Object.freeze(
  Object.fromEntries(
    [
      ethereumGoerli,
      polygonMumbai,
      optimismGoerli,
      avalancheFuji,
      nearTestnet,
      // ...
    ].map(
      ({
        standard,
        chainId,
        ...extras
      }: ChainMetadata<SupportedCaipProtocolStandard>) =>
        [
          stringifyCaip({
            parsedCaipType: {
              address: undefined,
              standard,
              chainId,
            },
            suppressAddressComponent: true,
          }),
          { standard, chainId, ...extras },
        ] as const
    )
  )
)

export function isChainMetadataMatchingStandard<
  T extends SupportedCaipProtocolStandard
>(
  chainMetadata: ChainMetadata<SupportedCaipProtocolStandard>,
  standard: T
): chainMetadata is ChainMetadata<T> {
  const { standard: maybeMatchingStandard } = chainMetadata

  return maybeMatchingStandard === standard
}

export const getMaybeChainMetadataByCaipType = <
  T extends SupportedCaipProtocolStandard
>(
  parsedCaipType: ParsedCaipType<T> | undefined
): ChainMetadata<T> | undefined => {
  if (!parsedCaipType) return undefined

  const {
    [stringifyCaip({ parsedCaipType, suppressAddressComponent: true })]:
      maybeChainMetadata,
  } = SUPPORTED_CHAINS

  const { standard } = parsedCaipType

  if (
    !maybeChainMetadata ||
    !isChainMetadataMatchingStandard(maybeChainMetadata, standard)
  )
    return undefined

  return maybeChainMetadata
}

export const getChainMetadataByCaipTypeOrThrow = <
  T extends SupportedCaipProtocolStandard
>(
  parsedCaipType: ParsedCaipType<T>
): ChainMetadata<T> => {
  const maybeChainMetadata = getMaybeChainMetadataByCaipType(parsedCaipType)

  if (!maybeChainMetadata)
    throw new Error(
      `Unable to determine ChainMetadata for "${stringifyCaip({
        parsedCaipType,
        suppressAddressComponent: true,
      })}".`
    )

  return maybeChainMetadata
}

export const getMaybeChainName = <T extends SupportedCaipProtocolStandard>(
  parsedCaipType: ParsedCaipType<T>
) => getMaybeChainMetadataByCaipType(parsedCaipType)?.name

export const getRpcUrlOrThrow = <T extends SupportedCaipProtocolStandard>(
  parsedCaipType: ParsedCaipType<T>
) => getChainMetadataByCaipTypeOrThrow(parsedCaipType).rpc
