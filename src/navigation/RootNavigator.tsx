import { createNavigationContainerRef } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import { StatusBar, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import LoadingView from '~/components/LoadingView'
import { useTheme } from '~/contexts'
import { useAuth } from '~/hooks/useAuth'

import { AuthNavigator } from './AuthNavigator'
import { MainNavigator } from './MainNavigator'
import { RootStackParams } from './types'

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

  const insets = useSafeAreaInsets()
  const { theme } = useTheme()

  if (!loaded) {
    return (
      <View
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          backgroundColor: theme.color.background,
        }}>
        <StatusBar
          // It's a full screen with no header and a light background
          barStyle='dark-content'
          backgroundColor='transparent'
          translucent
        />
        <LoadingView />
      </View>
    )
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
