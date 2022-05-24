import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as Sentry from '@sentry/react-native'
import parse from 'url-parse'

import { MainStackParams } from 'navigation/types'

export function useDeeplink(
  navigation: NativeStackNavigationProp<MainStackParams, keyof MainStackParams>
) {
  return function (url: string) {
    try {
      const parsedUrl = parse(url, true)
      const { pathname, query } = parsedUrl
      let screenName: keyof MainStackParams
      let type
      switch (pathname) {
        //TODO: Handle more deeplink thre
        case '/connection-success':
          screenName = 'Connections'
          type = 'tab'
          break
        default:
          type = 'screen'
          screenName = 'LoginRequest'
      }
      if (type === 'tab') {
        navigation.jumpTo(screenName, query as never)
      } else {
        navigation.navigate(screenName, query as never)
      }
    } catch (error) {
      Sentry.captureException(error)
    }
  }
}
