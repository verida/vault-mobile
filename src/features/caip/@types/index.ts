import { ChainIdParams } from 'caip'

// Source of truth for what protocols are supported by the app.
// TODO: should be moved to 'blockchain' feature
export enum SupportedCaipNamespace {
  EIP_155 = 'eip155',
  NEAR = 'near',
}

export type ChainMetadata = ChainIdParams & {
  readonly name: string
  readonly rpc: string
}

export type ChainMetadatas = Record<string, ChainMetadata>
