import { nanoid } from '@reduxjs/toolkit'
import { ProtocolHandler } from 'features/protocols'
import * as React from 'react'
import { InteractionManager } from 'react-native'

import { useMainNavigation } from 'navigation/hooks'

export function useStorybookProtocolHandler(): ProtocolHandler {
  const navigation = useMainNavigation()
  return React.useMemo<ProtocolHandler>(
    () => ({
      handleDeepLink: () => {
        if (!__DEV__) return false

        const key = `${nanoid()}`

        void InteractionManager.runAfterInteractions(() =>
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
