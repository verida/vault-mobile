import { CompositeNavigationProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import * as Sentry from '@sentry/react-native'
import parse from 'url-parse'

import { MainStackParams, DashboardTabParams } from 'navigation/types'

type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<DashboardTabParams, keyof DashboardTabParams>,
  NativeStackNavigationProp<MainStackParams, keyof MainStackParams>
>

export function useDeeplink(navigation: NavProp) {
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
        navigation.jumpTo('Connections')
      }
      navigation.navigate(screenName, query as never)
    } catch (error) {
      Sentry.captureException(error)
    }
  }
}
