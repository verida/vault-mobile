import { hasUserSetPinCode } from '@haskkor/react-native-pincode'
import { LinearGradient } from 'expo-linear-gradient'
import * as LocalAuthentication from 'expo-local-authentication'
import { selectIsBioAuthenticated, setBioAuthStatus } from 'features/auth'
import React, { FC, useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { useAuth } from 'hooks/useAuth'

import Logo from '../../assets/logo.svg'
import { CheckPin } from './CheckPin'
import { CreatePin } from './CreatePin'

export const Authenticate: FC = ({ children }) => {
  const dispatch = useDispatch()
  const [pinAuth, setPinAuth] = useState(false)
  const bioAuthenticated = useSelector(selectIsBioAuthenticated)
  const { authenticated } = useAuth()
  const [showCreatePin, setShowCreatePin] = useState(false)

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

  // Has no account or not yet did Bio authenticate
  if (!authenticated || bioAuthenticated) return <>{children}</>

  // Needs to create a Pin code
  if (showCreatePin) return <CreatePin />

  // Show Pin Authentication
  if (pinAuth && !bioAuthenticated)
    return <CheckPin finishProcess={() => dispatch(setBioAuthStatus(true))} />

  return (
    <LinearGradient
      colors={['#0E1572', '#1467CB', '#1995CB']}
      style={styles.container}>
      <Text>Please, wait for authentication complete!</Text>
      <View style={styles.content}>
        <Logo />
        <ActivityIndicator size='large' color='#fff' />
      </View>
    </LinearGradient>
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
