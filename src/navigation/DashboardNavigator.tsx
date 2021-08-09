import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardTabParams } from 'navigation/types';
import Home from 'pages/Dashboard/Home';
import Folders from 'pages/Data/Folders';
import Profiles from 'pages/Dashboard/Profiles';

const Tab = createBottomTabNavigator<DashboardTabParams>();

function DashboardNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name={'Home'} component={Home}/>
      <Tab.Screen name={'Data'} component={Folders}/>
      <Tab.Screen name={'Profiles'} component={Profiles}/>
    </Tab.Navigator>
  );
}

export default DashboardNavigator
