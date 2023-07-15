import { LinkingOptions } from '@react-navigation/native'

import { RootStackParams } from 'navigation/types'

export const navigationLinkingConfiguration: LinkingOptions<RootStackParams> = {
  prefixes: ['https://vault.verida.io/'],
  config: {
    screens: {
      Main: {
        screens: {
          LoginRequest: 'request',
          Inbox: 'inbox',
        },
      },
    },
  },
}
