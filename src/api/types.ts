/**
 * Specific chain and network identifier matching the CAIP standard:
 *
 * - eip2551:1 = ethereum mainnet
 * - eip2551:4 = goerli testnet
 *
 * Use https://github.com/ChainAgnostic/caip-js
 */
import { AssetId } from 'caip'

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
 * A blockchain network (ie: goerli)
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
  address?: string
  publicKey?: string
  mnemonic?: string
  chainId?: string
  derivationPath?: string
  blockchainNetwork?: BlockchainNetwork
}

export type BlockchainAccounts = Record<
  // HACK: There are also some deprecated standards, such as algorand, which may
  //       appear in an instance of VeridaWalletAccounts. Please take
  //       "SupportedCaipProtocolStandard" with a grain of salt here.
  string,
  BlockchainAccount
>

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
  viewOnly?: boolean
  walletType: string // "multi" for a multi coin, otherwise the CAIP chain reference (ie: "eip155:5")
}

export interface BlockchainWalletWithAccounts extends BlockchainWallet {
  accounts: Record<string, BlockchainAccount>

  // Transient fields for displaying
  icon?: string
  count?: number
}

// What network is this?
export type Network = {
  name: string
  default_node_code: string
  nodes: NetworkNode[]
  selected_node?: number
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

export type ShoppingCoupon = {
  readonly title: string
  readonly description: string
  readonly value: string
  readonly valueType: string
  readonly currency: string
  readonly barcode: string
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

export enum VeridaOnePlatforms {
  // DISCORD = 'discord',
  FACEBOOK = 'facebook',
  GITHUB = 'github',
  LINKEDIN = 'linkedin',
  INSTAGRAM = 'instagram',
  TELEGRAM = 'telegram',
  TWITTER = 'twitter',
  // WHATSAPP = 'whatsapp',
  // YOUTUBE = 'youtube',
}

export interface VeridaOnePlatformLink {
  category: VeridaOnePlatformLinkCategory
  platform: VeridaOnePlatforms
  accountId: string
  url: string
  order: number
  verificationProof?: VeridaOneVerificationProof
  avatarUrl?: string

  // Transient fields
  showOnVeridaOne?: boolean
  connectedPlatform?: boolean
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

  // Transient fields
  isPublic?: boolean
  veridaWalletName?: string
  icon?: string
}

export interface VeridaOneFeaturedAsset {
  chainId: string
  contractAddress: string
  tokenId: string
  ownerAddress: string
  order: number

  // Transient fields
  uri?: string
}

export interface VeridaOneProfile {
  _id: string
  _rev?: string
  customLinks: VeridaOneCustomLink[]
  platformLinks: VeridaOnePlatformLink[]
  walletAddresses: VeridaOneWalletAddress[]
  featuredAssets: VeridaOneFeaturedAsset[]
}
