import { hasUserSetPinCode } from '@haskkor/react-native-pincode'
import { LinearGradient } from 'expo-linear-gradient'
import * as LocalAuthentication from 'expo-local-authentication'
import React, { FC, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'

import WalletLogo from '~/assets/logos/app/verida_wallet_logo_colored_white.svg'
import { useTheme } from '~/contexts'
import { selectIsBioAuthenticated, setBioAuthStatus } from '~/features/auth'
import { useAuth } from '~/hooks/useAuth'

import { CheckPin } from './CheckPin'
import { CreatePin } from './CreatePin'

export const Authenticate: FC = ({ children }) => {
  const dispatch = useDispatch()
  const [pinAuth, setPinAuth] = useState<boolean>(false)
  const bioAuthenticated = useSelector(selectIsBioAuthenticated)
  const { authenticated } = useAuth()
  const [showCreatePin, setShowCreatePin] = useState<boolean>(false)

  useEffect(() => {
    async function setShouldAuthByPIN() {
      const hasPIN = await hasUserSetPinCode()
      if (!hasPIN) {
        setShowCreatePin(true)
      } else {
        setPinAuth(true)
      }
    }

    const init = async () => {
      if (!authenticated || bioAuthenticated) return

      const enrolledLevel = await LocalAuthentication.getEnrolledLevelAsync()
      if (enrolledLevel === LocalAuthentication.SecurityLevel.BIOMETRIC) {
        const { success } = await LocalAuthentication.authenticateAsync()
        if (success) {
          dispatch(setBioAuthStatus(true))
        } else {
          setShouldAuthByPIN()
        }
      } else {
        setShouldAuthByPIN()
      }
    }

    init()
  }, [bioAuthenticated, authenticated, dispatch])

  const insets = useSafeAreaInsets()
  const { theme } = useTheme()

  // Has no account or not yet did Bio authenticate
  if (!authenticated || bioAuthenticated) {
    return <>{children}</>
  }

  // Needs to create a Pin code
  if (showCreatePin) {
    return (
      <View
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          backgroundColor: theme.color.background,
        }}>
        <StatusBar
          // It's a full screen with no header and a light background
          barStyle='dark-content'
          backgroundColor='transparent'
          translucent
        />
        <CreatePin />
      </View>
    )
  }

  // Show Pin Authentication
  if (pinAuth && !bioAuthenticated) {
    return (
      <View
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          backgroundColor: theme.color.background,
        }}>
        <StatusBar
          // It's a full screen with no header and a light background
          barStyle='dark-content'
          backgroundColor='transparent'
          translucent
        />
        <CheckPin finishProcess={() => dispatch(setBioAuthStatus(true))} />
      </View>
    )
  }

  return (
    <>
      <StatusBar
        // It's a full screen with no header and a dark background
        barStyle='light-content'
        backgroundColor='transparent'
        translucent
      />
      <LinearGradient
        colors={['#0E1572', '#1467CB', '#1995CB']}
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}>
        <Text>Please, authenticate with your biometrics or PIN code</Text>
        <View style={styles.content}>
          <WalletLogo width={156} height={52} />
          <ActivityIndicator size='large' color='#fff' />
        </View>
      </LinearGradient>
    </>
  )
}

export default Authenticate

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingTop: 30,
  },
})
