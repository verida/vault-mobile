import { ObjectValues } from 'types/utils'

import { PROTOCOLS } from '../constants'

export type Protocol = ObjectValues<typeof PROTOCOLS>

export type ProtocolDefinition = {
  protocol: Protocol
  label: string
  getLogo: (size: number) => React.ReactNode
  // TODO: update arguments if needed
}
