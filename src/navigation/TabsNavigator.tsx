import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from 'react-native-vector-icons/Ionicons'

import { PRIMARY_COLOR } from 'constants/color'
import { TabsScreenParams } from 'navigation/types'
import Assets from 'pages/AssetsCollections'
// import { ConnectionsTabScreen } from 'pages/Connections/DataConnector'
import { HomeTabScreen } from 'pages/Dashboard/Home'
import { DataTabScreen } from 'pages/Data'
import { PublicProfile } from 'pages/Profiles/PublicProfile'

const tabIcons: Record<
  keyof TabsScreenParams,
  { default: string; focused: string }
> = {
  Home: { default: 'home', focused: 'home' },
  Profile: { default: 'person', focused: 'person' },
  Data: { default: 'server', focused: 'server' },
  // Connections: { default: 'share-social', focused: 'share-social' },
  Assets: { default: 'wallet', focused: 'wallet' },
}

const Tabs = createBottomTabNavigator<TabsScreenParams>()

export const TabsNavigator: React.FunctionComponent = () => {
  const insets = useSafeAreaInsets()
  return (
    <Tabs.Navigator
      initialRouteName='Home'
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: PRIMARY_COLOR,
        tabBarStyle: {
          height: 50 + (insets.bottom === 0 ? 6 : insets.bottom), // 40 (icon and label) + 10 (padding top) + 6 or instes.bottom (padding bottom)
          paddingTop: 10,
          paddingBottom: insets.bottom || 6, // insets.bottom act as padding
        },
        tabBarIcon: ({ color, focused, size }) => {
          const iconName = focused
            ? tabIcons[route.name].focused
            : tabIcons[route.name].default
          return <Ionicons name={iconName} size={size} color={color} />
        },
      })}>
      <Tabs.Screen name='Home' component={HomeTabScreen} />
      <Tabs.Screen name='Profile' component={PublicProfile} />
      <Tabs.Screen name='Data' component={DataTabScreen} />
      {/* <Tabs.Screen name='Connections' component={ConnectionsTabScreen} /> */}
      <Tabs.Screen name='Assets' component={Assets} />
    </Tabs.Navigator>
  )
}
