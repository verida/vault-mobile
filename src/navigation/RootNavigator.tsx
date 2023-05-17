import { createNavigationContainerRef } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useEmitter } from 'hooks'
import React, { useCallback, useEffect, useRef } from 'react'

import AccountManager from 'api/AccountManager'
import LoadingView from 'components/LoadingView'
import { useAuth } from 'hooks/useAuth'
import AuthNavigator from 'navigation/AuthNavigator'
import MainNavigator from 'navigation/MainNavigator'
import { RootStackParams } from 'navigation/types'

const Stack = createNativeStackNavigator<RootStackParams>()
export const navigationRef = createNavigationContainerRef<RootStackParams>()

export function navigate(name: unknown, params: unknown) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never, params as never)
  }
}

function RootNavigator() {
  const { refresh, authenticated, loaded } = useAuth()
  const mounted = useRef(false)

  const init = useCallback(async () => {
    await refresh()
  }, [refresh])

  useEffect(() => {
    if (mounted.current) {
      return
    }
    mounted.current = true

    // This is to prevent the AccountManager initialize many times
    // TODO: Refactor the organization of app navigation to fix this instead
    const tid = setTimeout(() => {
      init()
    }, 10)
    return () => clearTimeout(tid)
  }, [init])

  useEmitter(
    'APP_RECOVER_FROM_ERROR',
    async () => {
      init()
    },
    []
  )

  if (!loaded) {
    return <LoadingView />
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!authenticated ? (
        <Stack.Screen name={'Auth'} component={AuthNavigator} />
      ) : (
        <Stack.Screen name={'Main'} component={MainNavigator} />
      )}
    </Stack.Navigator>
  )
}

export default RootNavigator
