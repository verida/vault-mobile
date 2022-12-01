import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'

import { AuthStackParams } from 'navigation/types'
import Create from 'pages/Account/Create'
import CreateIdentity from 'pages/Account/Identity/CreateIdentity'
import Import from 'pages/Account/Import'
import Start from 'pages/Account/Start'
import CreatePin from 'pages/Authentication/CreatePin'
import SeedPhrase from 'pages/SeedPhrase/SeedPhrase'
import SeedPhraseEntered from 'pages/SeedPhrase/SeedPhraseEntered'
import SeedPhraseGenerated from 'pages/SeedPhrase/SeedPhraseGenerated'
import VerifyPhrase from 'pages/SeedPhrase/VerifyPhrase'
import SelectNetwork from 'pages/SelectNetwork'
import Success from 'pages/Success'

const Stack = createNativeStackNavigator<AuthStackParams>()

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={'Start'} component={Start} />
      <Stack.Screen name={'CreateIdentity'} component={CreateIdentity} />
      <Stack.Screen name={'CreateAccount'} component={Create} />
      <Stack.Screen name={'ImportAccount'} component={Import} />
      <Stack.Screen name={'SeedPhrase'} component={SeedPhrase} />
      <Stack.Screen
        name={'SeedPhraseGenerated'}
        component={SeedPhraseGenerated}
      />
      <Stack.Screen name={'SeedPhraseEntered'} component={SeedPhraseEntered} />
      <Stack.Screen name={'VerifyPhrase'} component={VerifyPhrase} />
      <Stack.Screen name={'CreatePin'} component={CreatePin} />
      <Stack.Screen name={'Success'} component={Success} />
      <Stack.Screen name={'SelectNetwork'} component={SelectNetwork} />
    </Stack.Navigator>
  )
}

export default AuthNavigator
