import { ProtocolHandler } from 'features/protocols'
import * as React from 'react'

import { useMainNavigation } from 'navigation/hooks'

export function useStorybookProtocolHandler(): ProtocolHandler {
  const navigation = useMainNavigation()
  return React.useMemo<ProtocolHandler>(
    () => ({
      handleDeepLink: () => {
        if (!__DEV__) return false

        navigation.navigate('__Storybook__')

        return true
      },
      handleQrCode: () => false,
    }),
    [navigation]
  )
}
