import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParams } from 'navigation/types';
import DashboardNavigator from 'navigation/DashboardNavigator';

const Stack = createNativeStackNavigator<MainStackParams>();

function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name={'Dashboard'} component={DashboardNavigator}/>
    </Stack.Navigator>
  );
}

export default MainNavigator;
