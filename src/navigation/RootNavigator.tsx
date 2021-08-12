import React, { useEffect } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { RootStackParams } from 'navigation/types'
import AuthNavigator from 'navigation/AuthNavigator'
import MainNavigator from 'navigation/MainNavigator'
import { useAuth } from 'hooks/useAuth'

const Stack = createNativeStackNavigator<RootStackParams>()

function RootNavigator() {
  const { initialize, authenticated, loaded } = useAuth()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (!loaded) {
    return null
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
