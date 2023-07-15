import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { CompositeNavigationProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as Sentry from '@sentry/react-native'
import { useCallback } from 'react'
import parse from 'url-parse'

import { DashboardTabParams, MainStackParams } from 'navigation/types'

type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<DashboardTabParams, keyof DashboardTabParams>,
  NativeStackNavigationProp<MainStackParams, keyof MainStackParams>
>

// TODO: To be handled as a protocol handler (for the Verida Connect part) or in Navigation linking configuration for pure screens navigation

export function useDeeplink(navigation: NavProp) {
  return useCallback(
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
