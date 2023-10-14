import { ChainIdParams } from 'caip'

// Source of truth for what protocols are supported by the app.
export enum SupportedCaipNamespace {
  EIP_155 = 'eip155',
  NEAR = 'near',
}

// The minimum information necessary to actually perform a transaction.
export type ChainMetadata = ChainIdParams & {
  readonly name: string
  readonly rpc: string
}

// A list of ChainMetadata. Note - this may contain duplicate configuration settings,
// for example, a custom Ethereum Mainnet configuration and the default Ethereum Mainnet
// configuration.
export type ChainMetadatas = readonly ChainMetadata[]

export type CustomChains = {
  readonly loading: boolean
  readonly result: ChainMetadata[]
  readonly error?: Error
}

export const CAIP_SLICE_NAME = 'caip'

export type UseChainMetadataState = {
  readonly loading: boolean
  readonly result?: ChainMetadatas
  readonly error?: Error
}
