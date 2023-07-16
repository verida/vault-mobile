import { LinkingOptions } from '@react-navigation/native'

import { RootStackParams } from 'navigation/types'

/**
 * This is the configuration for the navigation linking.
 *
 * We should defined here all the screens that can be opened from a deeplink.
 *
 * But left out the ones that are related to protocols, such as the ConnectRequest which is handled by the protocol handler feature, and eventually called by Verida Connect, Polygon ID, etc.
 */
export const navigationLinkingConfiguration: LinkingOptions<RootStackParams> = {
  prefixes: ['https://vault.verida.io/'],
  config: {
    screens: {
      Main: {
        screens: {
          LoginRequest: 'request', // TODO: Keep it as long as Verida Connect uses LoginRequest. When migrated to ConnectionRequest, remove it.
          Inbox: 'inbox', // TODO: Double check if related to notification and whether it should be handled by a protocol handler. One the other end, It can be usefull to have a navigtion link to the inbox. Check if any conflict if both are defined.
        },
      },
    },
  },
}
