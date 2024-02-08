export interface PagingInfo {
  total: number
  page: number
  page_size: number
  cursor?: string | null
}

// Have to set some number fields as strings to keep compatible with Morallis response
export interface NFT {
  chain_id?: string
  token_address: string
  token_id: string
  amount: string
  owner_of: string
  owner_address?: string
  token_hash: string
  block_number_minted: string
  block_number: string
  contract_type: string
  name: string
  symbol: string
  token_uri: string | null
  metadata: string | null // JSON string
  last_token_uri_sync: string | null
  last_metadata_sync: string | null
  minter_address: string | null
}

export type OpenSeaStringTrait = {
  readonly trait_type: string
  readonly value: string
}

export interface NFTMetadata {
  readonly name: string
  readonly description: string
  readonly animation_url: string
  readonly external_url: string
  readonly attributes: OpenSeaStringTrait[]
  readonly background_color: string
  readonly youtube_url: string

  // TODO: This is not part of the OpenSea Metadata Standard: https://docs.opensea.io/docs/metadata-standards
  readonly symbol: string // ?

  // TODO: The standard demands you either specify `image` or `image_data`, not both:
  readonly image: string
  readonly image_data: string
}

export interface NFTCollection {
  token_address: string
  contract_type: string
  name: string
  symbol: string
  nfts: {
    data: NFT[]
  } & PagingInfo
}

export interface WalletNFTsResponse extends PagingInfo {
  collections: NFTCollection[]
  status?: string
}

// FIXME: Need to update, not the real type of badge
export interface Badge {
  token_address: string
  token_id: string
  amount: string
  owner_of: string
  token_hash: string
  block_number_minted: string
  block_number: string
  contract_type: string
  name: string
  symbol: string
  token_uri: string | null
  metadata: string | null
  last_token_uri_sync: string | null
  last_metadata_sync: string | null
  minter_address: string | null
}

export interface ClaimBadgeResponse {
  badge?: Badge | null
  success?: boolean
}
