import { LinkingOptions } from '@react-navigation/native'
import { RootStackParams } from 'navigation/types'

const linking: LinkingOptions<RootStackParams> = {
  prefixes: ['veridavault://', 'https://vault.verida.io/sso'],
  config: {
    screens: {
      Main: {
        screens: {
          LoginRequest: 'login-request',
        },
      },
    },
  },
}

export default linking
