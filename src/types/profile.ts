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
