export interface PublicWalletAddress {
  address: string
  chainId: string
  label: string
  order: number

  isPublic?: boolean
  veridaWalletName?: string
  icon?: string
}
