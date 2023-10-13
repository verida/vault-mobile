import { ChainIdParams } from 'caip'

// Source of truth for what protocols are supported by the app.
export enum SupportedCaipNamespace {
  EIP_155 = 'eip155',
  NEAR = 'near',
}

export type ChainMetadata = ChainIdParams & {
  readonly name: string
  readonly rpc: string
}

export type ChainMetadatas = Record<string, ChainMetadata>

// TODO: implement me with verida datastore
// HACK: This is actually a ShoppingCoupon: https://common.schemas.verida.io/shopping/coupon/v0.1.0/schema.json
export type CustomNetwork = {
  readonly title: string
  readonly description: string
  readonly value: string
  readonly valueType: string
  readonly currency: string
  readonly barcode: string
}

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
