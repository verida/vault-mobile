import { nanoid } from '@reduxjs/toolkit'
import { ProtocolHandler } from 'features/protocols'
import * as React from 'react'
import { InteractionManager } from 'react-native'

import { useMainNavigation } from 'navigation/hooks'

export function useStorybookProtocolHandler(): ProtocolHandler {
  const navigation = useMainNavigation()
  return React.useMemo<ProtocolHandler>(
    () => ({
      handleDeepLink: (url: string) => {
        if (
          !__DEV__ ||
          typeof url !== 'string' ||
          !url.startsWith('storybook://')
        )
          return false

        const key = `${nanoid()}`

        InteractionManager.runAfterInteractions(() =>
          navigation.reset({
            key,
            routes: [{ key, name: '__Storybook__' }],
          })
        )

        return true
      },
      handleQrCode: () => false,
    }),
    [navigation]
  )
}
