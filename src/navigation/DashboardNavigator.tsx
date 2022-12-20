import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React from 'react'
import { Platform } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

import { PRIMARY_COLOR } from 'constants/color'
import { DashboardTabParams } from 'navigation/types'
import Assets from 'pages/AssetsCollections'
import DataConnector from 'pages/Connections/DataConnector'
import Home from 'pages/Dashboard/Home'
import Profiles from 'pages/Dashboard/Profiles'
import Folders from 'pages/Data/Folders'

const Tab = createBottomTabNavigator<DashboardTabParams>()

function DashboardNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PRIMARY_COLOR,
        tabBarStyle: Platform.select({
          ios: {},
          android: { height: 64, paddingBottom: 16 },
        }),
      }}>
      <Tab.Screen
        name={'Home'}
        component={Home}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name='home' size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={'Data'}
        component={Folders}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name='server' size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={'Profiles'}
        component={Profiles}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name='md-person-sharp' size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={'Connections'}
        component={DataConnector}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name='file-tray-full' size={24} color={color} />
          ),
        }}
      />
      {/* {isVeridaTeamMember && ( */}
      <Tab.Screen
        name={'Assets'}
        component={Assets}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name='wallet' size={24} color={color} />
          ),
        }}
      />
      {/* )} */}
    </Tab.Navigator>
  )
}

export default DashboardNavigator
