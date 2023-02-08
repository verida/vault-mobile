import { ImageSourcePropType } from 'react-native'

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

export type AddIdentityStepType =
  | 'CreateIdentifier'
  | 'DefineNameAndUsername'
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
