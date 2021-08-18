import { LinkingOptions } from '@react-navigation/native'
import { RootStackParams } from 'navigation/types'

const linking: LinkingOptions<RootStackParams> = {
  prefixes: ['veridavault://'],
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
