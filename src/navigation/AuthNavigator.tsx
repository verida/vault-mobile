import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'

import { BaseScreenHeader } from '~/components'
import { AuthStackParams } from '~/navigation/types'
import { CreatePinScreen } from '~/pages/Authentication'
import {
  AddIdentityScreen,
  CreateIdentityScreen,
  ImportIdentityScreen,
} from '~/pages/Identity'
import { OnboardingScreen } from '~/pages/Onboarding'
import {
  SeedPhraseGeneratedScreen,
  SeedPhraseScreen,
  VerifyPhraseScreen,
} from '~/pages/RecoveryPhrase'

const Stack = createNativeStackNavigator<AuthStackParams>()

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName='Onboarding'
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name='SeedPhrase' component={SeedPhraseScreen} />
      <Stack.Screen
        name='SeedPhraseGenerated'
        component={SeedPhraseGeneratedScreen}
      />
      <Stack.Screen name='VerifyPhrase' component={VerifyPhraseScreen} />

      <Stack.Group
        screenOptions={{
          headerShown: true,
          headerShadowVisible: true,
          header: (props) => <BaseScreenHeader {...props} />,
        }}>
        <Stack.Screen name='Onboarding' component={OnboardingScreen} />
        <Stack.Screen name='AddIdentity' component={AddIdentityScreen} />
        <Stack.Screen name='CreateIdentity' component={CreateIdentityScreen} />
        <Stack.Screen name='ImportIdentity' component={ImportIdentityScreen} />
        <Stack.Screen name='CreatePin' component={CreatePinScreen} />
      </Stack.Group>
    </Stack.Navigator>
  )
}
