export interface PublicWalletAddress {
  address: string
  chainId: string
  label: string
  order: number

  isPublic?: boolean
  veridaWalletName?: string
  icon?: string
}

export interface OneProfileCustomLink {
  label: string
  url: string
  order: number
  featured: boolean
}

export interface OneProfileFeaturedAsset {
  chainId: string
  contractAddress: string
  tokenId: string
  ownerAddress: string
  order: number

  // Transient fields
  uri?: string
}
