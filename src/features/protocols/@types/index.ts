import { PROTOCOLS } from 'features/protocols'
import { ObjectValues } from 'types/utils'

export type Protocol = ObjectValues<typeof PROTOCOLS>

export type ProtocolDefinition = {
  protocol: Protocol
  label: string
  getLogo: (size: number) => React.ReactNode
  // Update arguments if needed
}

export interface ProtocolHandler {
  // Handlers are considered synchronous, refactor if needed
  handleQrCode(qrCodeMessage: string): boolean
  handleDeepLink(url: string): boolean
  // Extend this interface if needed
}
