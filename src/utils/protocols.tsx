import React from 'react'
import { Protocol, ProtocolDefinition } from 'types'

import PolygonIdLogo from 'assets/protocols/polygon_id_protocol_logo.svg'
import VeridaLogo from 'assets/protocols/verida_network_protocol_logo.svg'
import WalletConnectLogo from 'assets/protocols/walletconnect_protocol_logo.svg'

export const protocolDefinitions: Record<Protocol, ProtocolDefinition> = {
  verida: {
    protocol: 'verida',
    label: 'Verida',
    getLogo: (size) => <VeridaLogo width={size} height={size} />,
  },
  polygonid: {
    protocol: 'polygonid',
    label: 'Polygon ID',
    getLogo: (size) => <PolygonIdLogo width={size} height={size} />,
  },
  walletconnect: {
    protocol: 'walletconnect',
    label: 'WalletConnect',
    getLogo: (size) => (
      <WalletConnectLogo width={size} height={(size * 332) / 480} />
    ),
    // TODO: Get logo for WalletConnect
  },
}

export function getProtocolLabel(protocol: Protocol) {
  return protocolDefinitions[protocol].label
}

export function getProtocolLogo(protocol: Protocol, size: number) {
  return protocolDefinitions[protocol].getLogo(size)
}
