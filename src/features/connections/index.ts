import {
  Connection,
  ConnectionType,
  SupportedConnection,
} from 'types/connections'

// FIXME: This is some mock data for the Badge feature.
// This information is not easily available while implementing the Badges.
// Must check DataConnectorManager.ts on how to retrieve it from the actual connections

const FacebookIcon = require('assets/social_icons/facebook.png')
const TwitterIcon = require('assets/social_icons/twitter.png')

/** Definitions of the supported connections. */
export const connectionTypes: ConnectionType[] = [
  {
    name: 'twitter',
    label: 'Twitter',
    icon: TwitterIcon,
  },
  // {
  //   name: 'discord',
  //   label: 'Discord',
  //   icon: // Missing icon for Discord
  // },
  {
    name: 'facebook',
    label: 'Facebook',
    icon: FacebookIcon,
  },
]

/** Data of the currently enabled connections. ie: The user is connected with an account. */
export const connections: Connection[] = [
  {
    type: 'twitter',
    account: 'tahpot',
    proof: 'did:vda:0x5467...78-tahpot', // Supposed to be extracted from the network
  },
]

/**
 * This method returns mock data!!
 *
 * Get the details of a connection.
 */
export const getConnectionType = (
  connectionName: SupportedConnection
): ConnectionType | undefined => {
  return connectionTypes.find(
    (connection) => connection.name === connectionName
  )
}

/**
 * This method returns mock data!!
 *
 * Get the data of a connection.
 */
export const getConnectionData = (
  connectionName: SupportedConnection
): Connection | undefined => {
  return connections.find((connection) => connection.type === connectionName)
}
