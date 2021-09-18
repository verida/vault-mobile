import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AuthStackParams } from 'navigation/types'
import Start from 'pages/Account/Start'
import Create from 'pages/Account/Create'
import Import from 'pages/Account/Import'
import SeedPhrase from 'pages/SeedPhrase/SeedPhrase'
import VerifyPhrase from 'pages/SeedPhrase/VerifyPhrase'
import CreatePin from 'pages/Authentication/CreatePin'
import SeedPhraseGenerated from 'pages/SeedPhrase/SeedPhraseGenerated'
import SeedPhraseEntered from 'pages/SeedPhrase/SeedPhraseEntered'
import Success from 'pages/Success'
import SelectNetwork from 'pages/SelectNetwork'
import ScanQrCode from 'pages/ScanQrCode/ScanQrCode'

const Stack = createNativeStackNavigator<AuthStackParams>()

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={'Start'} component={Start} />
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
