import { createNavigationContainerRef } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'

import LoadingView from 'components/LoadingView'
import { useAuth } from 'hooks/useAuth'
import AuthNavigator from 'navigation/AuthNavigator'
import { MainNavigator } from 'navigation/MainNavigator'
import { RootStackParams } from 'navigation/types'

const Stack = createNativeStackNavigator<RootStackParams>()
export const navigationRef = createNavigationContainerRef<RootStackParams>()

// TODO: type
export function navigate(name: any, params: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params)
  }
}

export const RootNavigator: React.FunctionComponent = () => {
  const { authenticated, loaded } = useAuth()
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
