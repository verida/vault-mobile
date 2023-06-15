import * as React from 'react'

export type Protocol = 'verida' | 'polygonid' | 'walletconnect'

export type ProtocolDefinition = Readonly<{
  protocol: Protocol
  label: string
  getLogo: (size: number) => React.ReactNode
}>
