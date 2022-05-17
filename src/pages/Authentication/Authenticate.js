import { hasUserSetPinCode } from '@haskkor/react-native-pincode'
import { LinearGradient } from 'expo-linear-gradient'
import * as LocalAuthentication from 'expo-local-authentication'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'

import { useAuth } from 'hooks/useAuth'

import Logo from '../../assets/logo.svg'
import { setAuthStatus as setAuthStatusAction } from '../../reduxStore/general/actions'
import CheckPin from './CheckPin'

const Authenticate = (props) => {
  const { setAuthStatus, authenticated: localAuthenticated, children } = props
  const [pinAuth, setPinAuth] = useState(false)
  const { authenticated } = useAuth()

  useEffect(() => {
    async function setShouldAuthByPIN() {
      const hasPIN = await hasUserSetPinCode()
      if (!hasPIN) {
        setAuthStatus(true)
      }
      setPinAuth(true)
    }

    const init = async () => {
      if (localAuthenticated || !authenticated) return
      const enrolledLevel = await LocalAuthentication.getEnrolledLevelAsync()

      if (enrolledLevel === LocalAuthentication.SecurityLevel.BIOMETRIC) {
        const { success } = await LocalAuthentication.authenticateAsync()
        if (success) {
          setAuthStatus(true)
        } else {
          setShouldAuthByPIN()
        }
      } else {
        setShouldAuthByPIN()
      }
    }

    init()
  }, [authenticated, localAuthenticated, setAuthStatus])

  if (!authenticated || localAuthenticated) return children
  if (pinAuth) return <CheckPin finishProcess={() => setAuthStatus(true)} />

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

const mapStateToProps = (rootState) => {
  const state = rootState.main
  return { authenticated: state.authenticated }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setAuthStatus: (status) => dispatch(setAuthStatusAction(status)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Authenticate)

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
