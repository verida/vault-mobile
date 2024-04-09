import { ImageSourcePropType } from 'react-native'

export type VeridaOneVerificationProof = {
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

export type VeridaOnePlatformMetadata = {
  name: string
  label: string
  icon: ImageSourcePropType
  baseURL: string
  displayedPrefix?: string
}

export type VeridaOnePlatformLink = {
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

export type VeridaOneCustomLink = {
  label: string
  url: string
  order: number
  featured?: boolean
}

export type VeridaOneWalletAddress = {
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

export type VeridaOneFeaturedAsset = {
  chainId: string
  contractAddress: string
  tokenId: string
  ownerAddress: string
  order: number

  // Transient fields
  uri?: string
}

// TODO: Use the type VeridaRecord to wrap the Verida One profile specific type
export type VeridaOneProfile = {
  _id: string
  _rev?: string
  customLinks: VeridaOneCustomLink[]
  platformLinks: VeridaOnePlatformLink[]
  walletAddresses: VeridaOneWalletAddress[]
  featuredAssets: VeridaOneFeaturedAsset[]
}
