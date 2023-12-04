import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'

import { AuthStackParams } from 'navigation/types'
import Start from 'pages/Account/Start'
import { CreatePin } from 'pages/Authentication/CreatePin'
import {
  AddIdentityScreen,
  CreateIdentityScreen,
  ImportIdentityScreen,
} from 'pages/Identity'
import SeedPhrase from 'pages/SeedPhrase/SeedPhrase'
import SeedPhraseGenerated from 'pages/SeedPhrase/SeedPhraseGenerated'
import VerifyPhrase from 'pages/SeedPhrase/VerifyPhrase'

const Stack = createNativeStackNavigator<AuthStackParams>()

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={'Start'} component={Start} />

      <Stack.Screen name='AddIdentity' component={AddIdentityScreen} />
      <Stack.Screen name='CreateIdentity' component={CreateIdentityScreen} />
      <Stack.Screen name='ImportIdentity' component={ImportIdentityScreen} />

      <Stack.Screen name={'SeedPhrase'} component={SeedPhrase} />
      <Stack.Screen
        name={'SeedPhraseGenerated'}
        component={SeedPhraseGenerated}
      />
      <Stack.Screen name={'VerifyPhrase'} component={VerifyPhrase} />
      <Stack.Screen name={'CreatePin'} component={CreatePin} />
    </Stack.Navigator>
  )
}

export default AuthNavigator
