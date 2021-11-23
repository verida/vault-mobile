import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { DashboardTabParams } from 'navigation/types'
import Home from 'pages/Dashboard/Home'
import Folders from 'pages/Data/Folders'
import Profiles from 'pages/Dashboard/Profiles'
import Tokens from 'pages/Tokens/Dashboard'
import { PRIMARY_COLOR } from 'constants/color'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useAuth } from 'hooks/useAuth'

const Tab = createBottomTabNavigator<DashboardTabParams>()

function DashboardNavigator() {
  const { isVeridaTeamMember } = useAuth()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PRIMARY_COLOR,
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
            <Ionicons name='share-social' size={24} color={color} />
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
      {isVeridaTeamMember && (
        <Tab.Screen
          name={'Tokens'}
          component={Tokens}
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name='wallet' size={24} color={color} />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  )
}

export default DashboardNavigator
