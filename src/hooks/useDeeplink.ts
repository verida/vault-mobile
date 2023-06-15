import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { CompositeNavigationProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as Sentry from '@sentry/react-native'
import * as React from 'react'
import parse from 'url-parse'

import { DashboardTabParams, MainStackParams } from 'navigation/types'

type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<DashboardTabParams, keyof DashboardTabParams>,
  NativeStackNavigationProp<MainStackParams, keyof MainStackParams>
>

export function useDeeplink(navigation: NavProp) {
  return React.useCallback(
    (url: string) => {
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
    },
    [navigation]
  )
}
