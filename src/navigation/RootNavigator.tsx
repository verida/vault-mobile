import React, { useEffect, useRef } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { RootStackParams } from 'navigation/types'
import AuthNavigator from 'navigation/AuthNavigator'
import MainNavigator from 'navigation/MainNavigator'
import { useAuth } from 'hooks/useAuth'
import { createNavigationContainerRef } from '@react-navigation/native'
import LoadingView from 'components/LoadingView'
import AccountManager from 'api/AccountManager'

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

  useEffect(() => {
    if (mounted.current) {
      return
    }
    mounted.current = true
    console.log('ROOT NAVIGATOR rerender')
    async function init() {
      console.log('ROOT NAVIGATOR init')
      await AccountManager.getInstance().init()
      await refresh()
    }
    init()
  }, [refresh])

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
