import type { Protocol, ProtocolDefinition } from 'features/protocols'
import { WALLETCONNECT_LABEL } from 'features/walletConnect/constants'
import React from 'react'

import PolygonIdLogo from 'assets/logos/protocols/polygon_id_protocol_logo.svg'
import VeridaLogo from 'assets/logos/protocols/verida_protocol_logo.svg'
import WalletConnectLogo from 'assets/logos/protocols/walletconnect_protocol_logo.svg'

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
    label: WALLETCONNECT_LABEL,
    getLogo: (size) => (
      // The WalletConnect logo from their official brand assets is not a square, so have to adjust the height to keep the ratio
      <WalletConnectLogo width={size} height={(size * 332) / 480} />
    ),
  },
}

export function getProtocolLabel(protocol: Protocol) {
  return protocolDefinitions[protocol].label
}

export function getProtocolLogo(protocol: Protocol, size: number) {
  return protocolDefinitions[protocol].getLogo(size)
}
