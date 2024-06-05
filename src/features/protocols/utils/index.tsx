import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'

import PolygonIdLogo from '~/assets/logos/protocols/polygon_id_protocol_logo.svg'
import VeridaLogo from '~/assets/logos/protocols/verida_protocol_logo.svg'
import WalletConnectLogo from '~/assets/logos/protocols/walletconnect_protocol_logo.svg'
import type { Protocol, ProtocolDefinition } from '~/features/protocols'
import { WALLETCONNECT_LABEL } from '~/features/walletConnect/constants'
import { defaultTheme } from '~/styles/theme'

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
  blockchain: {
    protocol: 'blockchain',
    label: 'Blockchain',
    getLogo: (size) => (
      <Icon name='chain' size={size} color={defaultTheme.color.textLightGrey} />
    ),
  },
}

export function getProtocolLabel(protocol: Protocol) {
  return protocolDefinitions[protocol].label
}

export function getProtocolLogo(protocol: Protocol, size: number) {
  return protocolDefinitions[protocol].getLogo(size)
}

/**
 * Build a component with the Protocol logo and label for display (UI) purpose.
 *
 * Note: This should then be placed inside a Text component
 *
 * @param protocol The protocol
 * @param size size of the logo
 * @returns a JSX element
 */
export function formatProtocol(protocol: Protocol, size: number) {
  const protocolLogo = getProtocolLogo(protocol, size)
  const protocolLabel = getProtocolLabel(protocol)
  return (
    <>
      {protocolLogo} {protocolLabel}
    </>
  )
}

/**
 * Reduce an array of protocols into a single component with the Protocol logo and label for display (UI) purpose.
 *
 * Note: This should then be placed inside a Text component
 *
 * @param protocol The protocol
 * @param size size of the logo
 * @returns a JSX element
 */
export function reduceProtocols(protocols: Protocol[], size: number) {
  return protocols
    .map((protocol) => formatProtocol(protocol, size))
    .reduce((prev, curr) => (
      <>
        {prev}
        {', '}
        {curr}
      </>
    ))
}
