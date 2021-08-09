import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParams } from 'navigation/types';
import AuthNavigator from 'navigation/AuthNavigator';
import MainNavigator from 'navigation/MainNavigator';

const Stack = createNativeStackNavigator<RootStackParams>();

type RootNavigatorProps = {
  authorized: boolean
}

function RootNavigator(props: RootNavigatorProps) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!props.authorized ? (
        <Stack.Screen name={'Auth'} component={AuthNavigator}/>
      ): (
        <Stack.Screen name={'Main'} component={MainNavigator}/>
      )}
    </Stack.Navigator>
  );
}

export default RootNavigator;
