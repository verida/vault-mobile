import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

import { PRIMARY_COLOR } from 'constants/color'
import { TabsScreenParams } from 'navigation/types'
import Assets from 'pages/AssetsCollections'
// import { ConnectionsTabScreen } from 'pages/Connections/DataConnector' // TODO: uncomment when ready
import { HomeTabScreen } from 'pages/Dashboard/Home'
import { DataTabScreen } from 'pages/Data'
import { IdentityDrawer } from 'pages/Identity'
import { PublicProfileScreen } from 'pages/Profiles'

const tabIcons: Record<
  keyof TabsScreenParams,
  { default: string; focused: string }
> = {
  Home: { default: 'home', focused: 'home' },
  Profile: { default: 'person', focused: 'person' },
  Data: { default: 'server', focused: 'server' },
  // Connections: { default: 'share-social', focused: 'share-social' }, // TODO: uncomment when ready
  Assets: { default: 'wallet', focused: 'wallet' },
}

const Tabs = createBottomTabNavigator<TabsScreenParams>()

export const TabsNavigator: React.FunctionComponent = () => {
  const insets = useSafeAreaInsets()
  return (
    <IdentityDrawer>
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
        <Tabs.Screen
          name='Home'
          component={HomeTabScreen}
          options={({ route }) => ({
            tabBarIcon: ({ color, focused, size }) => {
              const iconName = focused
                ? tabIcons[route.name].focused
                : tabIcons[route.name].default
              return <MaterialIcons name={iconName} size={size} color={color} />
            },
          })}
        />
        <Tabs.Screen name='Profile' component={PublicProfileScreen as any} />
        {/*
      HACK: PublicProfileScreen as any because this screen is also define in the Main navigator and define its params from there and so was getting an error in Tabs navigator.
      TODO: We should delete the screen from the Main navigator and only use it from the Tabs navigator, but there are some sketchy access to it from the Main right now, so have to refactopr that first.
       */}
        <Tabs.Screen name='Data' component={DataTabScreen} />
        {/* <Tabs.Screen name='Connections' component={ConnectionsTabScreen} />
       TODO: uncomment when ready */}
        <Tabs.Screen name='Assets' component={Assets} />
      </Tabs.Navigator>
    </IdentityDrawer>
  )
}
