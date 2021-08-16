import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'

import Logo from '../../assets/logo.svg'
import CheckPin from './CheckPin'

import {
  setAuthStatus as setAuthStatusAction,
  setBioAuthStatus as setBioAuthStatusAction,
} from '../../store/general/actions'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from 'hooks/useAuth'

const Authenticate = (props) => {
  const {
    setBioAuthStatus,
    setAuthStatus,
    authenticated: localAuthenticated,
    children,
  } = props
  const [pinAuth, setPinAuth] = useState(false)
  const { authenticated } = useAuth()

  useEffect(() => {
    const init = async () => {
      if (authenticated) return
      const hasSavedBio = await LocalAuthentication.isEnrolledAsync()
      setBioAuthStatus(hasSavedBio)

      if (!hasSavedBio) return setPinAuth(true)

      const { success } = await LocalAuthentication.authenticateAsync()

      if (!success) return setPinAuth(true)

      return setAuthStatus(true)
    }

    init()
  }, [authenticated, setAuthStatus, setBioAuthStatus])

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

const mapStateToProps = (state) => {
  return { authenticated: state.authenticated }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setBioAuthStatus: (status) => dispatch(setBioAuthStatusAction(status)),
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
