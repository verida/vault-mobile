export interface ProtocolHandler {
  handleQRCode(qrCodeMessage: string): Promise<boolean>
  handleDeepLink(uri: string): Promise<boolean>

  /**
   * Return undefined to add more than one ProtocalHandler
   */
  identifier(): string | undefined
}
