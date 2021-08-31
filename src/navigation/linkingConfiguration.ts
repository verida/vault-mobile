import { LinkingOptions } from '@react-navigation/native'
import { RootStackParams } from 'navigation/types'

const linking: LinkingOptions<RootStackParams> = {
  prefixes: ['https://vault.verida.io/'],
  config: {
    screens: {
      Main: {
        screens: {
          LoginRequest: 'request',
        },
      },
    },
  },
}

export default linking
