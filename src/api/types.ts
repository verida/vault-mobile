/**
 * Specific chain and network identifier matching the CAIP standard:
 *
 * - eip2551:1 = ethereum mainnet
 * - eip2551:4 = goerli testnet
 * - algorand:EEEz7z6z = algorand testnet
 *
 * Use https://github.com/ChainAgnostic/caip-js
 */
import { AssetId } from 'caip'
import { ImageSourcePropType } from 'react-native'

/**
 * Verida Account
 */
export type Account = {
  did: string
  privateKey: string
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
  username?: string
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

/**
 * A blockchain network (ie: goerli or algorand testnet)
 */
export interface BlockchainNetwork {
  asset: AssetId
  chainId: string
  namespace: string
  reference: string
  name: string
  label: string
  chainName: string
  symbol: string
  explorerURL: string
  confirmations: number
  isMainnet: boolean
  decimal: number
  icon: string
  slip44Reference: string
  derivationPath: string
  subcoinType: string
  rpcUrl: string
}

export interface BlockchainAccount {
  privateKey?: string
  mnemonic?: string
  address?: string
  chainId?: string
  derivationPath?: string
  network: BlockchainNetwork
}

/**
 * @todo improve typescript
 *
 * Represents a blockchain wallet that is saved into a users list of wallets
 *
 * A wallet may be
 * 1. multi-chain with a single mnemonic and no private key
 * 2. single chain with a single private key
 * 3. single chain with a single mnemonic
 *
 * Must have either (privateKey or mnemonic)
 */
export interface BlockchainWallet extends BlockchainAccount {
  _id: string
  label: string
  multiChain: boolean
}

export interface BlockchainWalletWithAccounts extends BlockchainWallet {
  accounts: BlockchainAccount
}

// What network is this?
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

export type AddIdentityStepType =
  | 'CreateIdentifier'
  | 'ClaimUsername'
  | 'StorageLocation'
  | 'CreateProfile'

export type AddIdentityStepStatus = 'None' | 'Loading' | 'Success' | 'Failure'

/**
 * Verida One interfaces and enums
 */

export interface VeridaOneVerificationProof {
  type: string
  proof: string
}

export enum VeridaOnePlatformLinkCategory {
  SOCIAL = 'social',
}

export interface VeridaOnePlatformLink {
  category: VeridaOnePlatformLinkCategory
  platform: string
  accountId: string
  url: string
  order: number
  verificationProof?: VeridaOneVerificationProof
  avatarUrl?: string
}

export interface VeridaOneCustomLink {
  label: string
  url: string
  order: number
  featured?: boolean
}

export interface VeridaOneWalletAddress {
  chainId: string
  address: string
  order: number
  label?: string
  verificationProof?: string
}

export interface VeridaOneFeaturedAsset {
  chainId: string
  contractAddress: string
  tokenId: string
  ownerAddress: string
  order: number
}

export interface VeridaOneProfile {
  _id: string
  _rev?: string
  customLinks: VeridaOneCustomLink[]
  platformLinks: VeridaOnePlatformLink[]
  walletAddresses: VeridaOneWalletAddress[]
  featuredAssets: VeridaOneFeaturedAsset[]
}
