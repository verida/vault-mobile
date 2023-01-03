import { ImageSourcePropType } from 'react-native'

export type Account = {
  did: string
  mnemonic: string
  publicProfile?: UserData
  seedPhraseReminder: {
    lastTime?: number
    backedup: boolean
  }
}

export type UserData = {
  name: string
  country: string
  avatar?: ImageSourcePropType
  description?: string
}

export type NormalizedAccounts = {
  [k: string]: Account
}

export type NetworkNode = {
  node_code: string
  name: string
  description: string
  ISO2_CC: string
  icon?: string
  db_address: string
  messaging_address: string
  notification_address: string
}

export type Network = {
  name: string
  default_node_code: string
  nodes: NetworkNode[]
  selected_node?: number
}

export type NetworkCountry = {
  [key: string]: string
}

export type NetworkCountries = {
  [name: string]: NetworkCountry[]
}

export interface PagingInfo {
  total: number
  page: number
  page_size: number
  cursor?: string | null
}

// Have to set some number fields as strings to keep compatible with Morallis response
export interface NFT {
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
  metadata: string | null // JSON string
  last_token_uri_sync: string | null
  last_metadata_sync: string | null
  minter_address: string | null
}

export interface NFTMetadata {
  name: string
  symbol: string
  description: string
  animation_url: string
  image: string
  external_url: string
  attributes: any[]
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
