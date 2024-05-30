import { useNavigation } from '@react-navigation/native'
import { useCallback } from 'react'
import parse from 'url-parse'

import { Logger } from '~/features/telemetry'
import { MainStackParams } from '~/navigation/types'

const logger = Logger.create('DeepLinks')

// TODO: To be handled as a protocol handler (for the Verida Connect part) or in Navigation linking configuration for pure screens navigation

export function useDeeplink() {
  const navigation = useNavigation()

  return useCallback(
    (url: string) => {
      try {
        const parsedUrl = parse(url, true)
        const { pathname, query } = parsedUrl
        let screenName: keyof MainStackParams
        switch (pathname) {
          case '/connection-success': // TODO: I guess, should move to navigation linking configuration
            screenName = 'SingleConnection'
            break
          default:
            screenName = 'LoginRequest' // TODO: Should move to a Verida Connect protocol handler
        }

        if (screenName === 'SingleConnection') {
          // TODO: Remove the ts-ignore and try to fix the issue
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore need to better typing here
          navigation.jumpTo('Connections')
        }
        navigation.navigate(screenName, query as never)
      } catch (error) {
        logger.error(error)
      }
    },
    [navigation]
  )
}
