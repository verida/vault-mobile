import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { HomeScreenHeader, Icon, IconName, TabScreenHeader } from 'components'
import { useTheme } from 'contexts'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { TabsScreenParams } from 'navigation/types'
import { AssetsScreen } from 'pages/Assets'
// import { ConnectionsTabScreen } from 'pages/Connections/DataConnector' // TODO: uncomment when ready
import { DataTabScreen } from 'pages/Data'
import { HomeScreen } from 'pages/Home'
import { IdentityDrawer } from 'pages/Identity'
import { PublicProfileScreen } from 'pages/Profiles'

const tabIcons: Record<
  keyof TabsScreenParams,
  { default: IconName; focused: IconName }
> = {
  Home: { default: 'home', focused: 'home' },
  Profile: { default: 'user', focused: 'user' },
  Data: { default: 'data', focused: 'data' },
  // Connections: { default: 'connections', focused: 'connections' }, // TODO: uncomment when ready
  Assets: { default: 'wallet', focused: 'wallet' },
}

const Tabs = createBottomTabNavigator<TabsScreenParams>()

export const TabsNavigator: React.FunctionComponent = () => {
  const insets = useSafeAreaInsets()

  const { theme } = useTheme()

  return (
    <IdentityDrawer>
      <Tabs.Navigator
        initialRouteName='Home'
        screenOptions={({ route }) => ({
          headerShown: true,
          header: (props) => <TabScreenHeader {...props} />,
          headerShadowVisible: true,
          tabBarStyle: {
            height: 40 + 10 + (insets.bottom === 0 ? 6 : insets.bottom), // 40 (icon and label) + 10 (padding top) + 6 or insets.bottom (padding bottom)
            paddingTop: 10,
            paddingBottom: insets.bottom || 6, // insets.bottom act as padding
            borderTopWidth: 1,
          },
          tabBarIcon: ({ color, focused, size }) => {
            const iconName = focused
              ? tabIcons[route.name].focused
              : tabIcons[route.name].default
            return <Icon name={iconName} size={size} color={color} />
          },
          tabBarAllowFontScaling: false,
          tabBarInactiveTintColor: theme.color.textLightGrey,
        })}>
        <Tabs.Screen
          name='Home'
          component={HomeScreen}
          options={{
            header: (props) => <HomeScreenHeader {...props} />,
          }}
        />
        <Tabs.Screen name='Profile' component={PublicProfileScreen as any} />
        {/*
      HACK: PublicProfileScreen as any because this screen is also define in the Main navigator and define its params from there and so was getting an error in Tabs navigator.
      TODO: We should delete the screen from the Main navigator and only use it from the Tabs navigator, but there are some sketchy access to it from the Main right now, so have to refactopr that first.
       */}
        <Tabs.Screen name='Data' component={DataTabScreen} />
        {/* <Tabs.Screen name='Connections' component={ConnectionsTabScreen} />
       TODO: uncomment when ready */}
        <Tabs.Screen name='Assets' component={AssetsScreen} />
      </Tabs.Navigator>
    </IdentityDrawer>
  )
}
