import { hasUserSetPinCode } from '@haskkor/react-native-pincode'
import { LinearGradient } from 'expo-linear-gradient'
import * as LocalAuthentication from 'expo-local-authentication'
import { selectIsBioAuthenticated, setBioAuthStatus } from 'features/auth'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { useAuth } from 'hooks/useAuth'

import Logo from '../../assets/logo.svg'
import CheckPin from './CheckPin'

const Authenticate = (props) => {
  const { children } = props
  const dispatch = useDispatch()
  const [pinAuth, setPinAuth] = useState(false)
  const bioAuthenicated = useSelector(selectIsBioAuthenticated)
  const { authenticated } = useAuth()

  useEffect(() => {
    async function setShouldAuthByPIN() {
      const hasPIN = await hasUserSetPinCode()
      if (!hasPIN) {
        dispatch(setBioAuthStatus(true))
      }
      setPinAuth(true)
    }

    const init = async () => {
      if (bioAuthenicated || !authenticated) return
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
  }, [authenticated, bioAuthenicated, dispatch])

  if (!authenticated || bioAuthenicated) return children
  if (pinAuth)
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
