import { useNavigation } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import { useTheme } from 'contexts/ThemeContext'
import { emitter } from 'helpers/emitter'
import LottieView from 'lottie-react-native'
import React, { useImperativeHandle, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import UsernameManager from 'api/UsernameManager'
import BlurCircle from 'assets/blur_circle.svg'
import FailureCross from 'assets/failure_cross.svg'
import SuccessTick from 'assets/success_tick.svg'
import Container from 'components/Container'
import { Headline } from 'components/Typography/Headline'
import { Text } from 'components/Typography/Text'
import { Title } from 'components/Typography/Title'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

import Button from '../../components/Button'

export interface ClaimUsernamePageRefProps {
  claimUsername: (username: string) => void
}

const ClaimUsernamePage = React.forwardRef(
  (_, receivedRef: React.ForwardedRef<ClaimUsernamePageRefProps>) => {
    const navigation = useNavigation()
    const { bottom, top } = useSafeAreaInsets()
    const styles = useThemeAwareStyle(createStyles)
    const { theme } = useTheme()
    const [inputUsername, setInputUsername] = useState('')

    const [processing, setProcessing] = useState(false)
    const [, setClaimingUsername] = useState(false)
    const [showRetry, setShowRetry] = useState(false)
    const [isDoneCreateUsername, setDoneCreateUsername] = useState(false)
    const [createUsernameErrorMessage, setCreateUsernameErrorMessage] =
      useState('Please retry')

    useImperativeHandle(receivedRef, () => ({
      claimUsername: (username: string) => {
        handleClaimUsername(username)
      },
    }))

    const handleClaimUsername = async (newUsername: string) => {
      try {
        setShowRetry(false)
        setProcessing(true)
        setClaimingUsername(true)
        setInputUsername(newUsername)
        await UsernameManager.set(newUsername)
        setDoneCreateUsername(true)
        emitter.emit('UPDATE_PROFILE_USERNAME', {})
      } catch (error: any) {
        Sentry.captureException(error)
        setCreateUsernameErrorMessage(error.message)
        setShowRetry(true)
      } finally {
        setProcessing(false)
      }
    }

    return (
      <Container
        key='ClaimUsername'
        withKeyboardAvoidingView
        keyboadAvoidingViewProps={{ keyboardVerticalOffset: 60 + top }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: theme.spacing.xxl,
            paddingTop: theme.spacing.l,
            paddingHorizontal: theme.spacing.m,
          }}
          keyboardShouldPersistTaps='handled'>
          <View
            style={{
              width: 128,
              height: 128,
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
              marginTop: 56,
              marginBottom: theme.spacing.xl,
            }}>
            {processing ? (
              <>
                <BlurCircle />
                <LottieView
                  source={require('assets/animations/dots-loader.json')}
                  autoPlay
                  loop
                  style={styles.dotsLoader}
                />
              </>
            ) : isDoneCreateUsername ? (
              <SuccessTick />
            ) : (
              <FailureCross />
            )}
          </View>
          <Headline
            style={{
              alignSelf: 'center',
              fontSize: 28,
              marginBottom: theme.spacing.sm,
            }}>
            {isDoneCreateUsername
              ? 'Perfect'
              : showRetry
              ? 'Something went wrong'
              : 'Creating your username'}
          </Headline>
          <Text
            style={[
              {
                alignSelf: 'center',
                fontSize: theme.fontSize.l,
                color: theme.color.textLightGrey,
              },
            ]}>
            {isDoneCreateUsername
              ? `You successfully claimed username`
              : showRetry
              ? createUsernameErrorMessage
              : 'Please wait...'}
          </Text>
          {isDoneCreateUsername && (
            <Title
              style={{
                alignSelf: 'center',
                color: theme.color.textLightGrey,
                fontWeight: 'bold',
              }}>
              {inputUsername}
            </Title>
          )}
        </ScrollView>

        <View style={[styles.bottomNavContainer, { marginBottom: bottom }]}>
          {showRetry ? (
            <Button
              style={styles.button}
              onPress={() => handleClaimUsername(inputUsername)}>
              Retry
            </Button>
          ) : isDoneCreateUsername ? (
            <Button style={styles.button} onPress={() => navigation.goBack()}>
              Done
            </Button>
          ) : null}
        </View>
      </Container>
    )
  }
)

export default ClaimUsernamePage

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    dotsLoader: {
      width: 48,
      height: 48,
      position: 'absolute',
    },
    bottomNavContainer: {
      width: '100%',
      alignSelf: 'flex-end',
      marginBottom: theme.spacing.m,
    },
    button: {
      height: 48,
      marginHorizontal: theme.spacing.m,
      marginTop: theme.spacing.s,
      marginBottom: 0,
    },
    pagerView: {
      flex: 1,
    },
  })
