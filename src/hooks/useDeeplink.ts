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
      switch (pathname) {
        //TODO: Handle more deeplink thre
        case '/connection-success':
          screenName = 'SingleConnection'
          break
        default:
          screenName = 'LoginRequest'
      }

      if (screenName === 'SingleConnection') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore need to better typing here
        navigation.jumpTo('Connections')
      }
      navigation.navigate(screenName, query as never)
    } catch (error) {
      Sentry.captureException(error)
    }
  }
}
