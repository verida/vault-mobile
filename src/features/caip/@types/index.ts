import { ChainIdParams } from 'caip'

// Source of truth for what protocols are supported by the app.
export enum SupportedCaipNamespace {
  EIP_155 = 'eip155',
  NEAR = 'near',
}

export type ParsedCaipType = ChainIdParams & {
  readonly address: string | undefined
}

export type ChainMetadata = ChainIdParams & {
  readonly name: string
  readonly logo: string
  readonly rgb: string
  readonly rpc: string
}

export type ChainMetadatas = Record<string, ChainMetadata>
