export type Protocol = 'verida' | 'polygonid' | 'walletconnect'

export type ProtocolDefinition = {
  protocol: Protocol
  label: string
  getLogo: (size: number) => React.ReactNode
  // Add properties if needed
}

export type ProtocolHandler = {
  // Handlers are considered synchronous, refactor if needed
  handleQrCode(qrCodeMessage: string): boolean
  handleDeepLink(url: string): boolean
  // Add properties if needed
}
