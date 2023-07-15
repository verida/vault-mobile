export interface ProtocolHandler {
  // Handlers are considered synchronous, refactor if needed
  handleQrCode(qrCodeMessage: string): boolean
  handleDeepLink(url: string): boolean
  // Extend this interface if needed
}
