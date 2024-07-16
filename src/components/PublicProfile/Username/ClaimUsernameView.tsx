import { useNavigation } from '@react-navigation/native'
import LottieView from 'lottie-react-native'
import React, { useImperativeHandle, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import UsernameManager from '~/api/UsernameManager'
import BlurCircle from '~/assets/blur_circle.svg'
import FailureCross from '~/assets/failure_cross.svg'
import SuccessTick from '~/assets/success_tick.svg'
import { BottomActionBar } from '~/components/ScreenLayouts'
import { Headline } from '~/components/Typography/Headline'
import { Text } from '~/components/Typography/Text'
import { Title } from '~/components/Typography/Title'
import { useTheme } from '~/contexts/ThemeContext'
import { Logger } from '~/features/telemetry'
import { emitter } from '~/helpers/emitter'
import { useThemeAwareStyle } from '~/hooks/useThemeAwareStyle'
import { Theme } from '~/styles/types'

const logger = Logger.create('Components/ClaimUsernameView')

export interface ClaimUsernameViewRefProps {
  claimUsername: (username: string) => void
}

// TODO: Rework the layout properly
export const ClaimUsernameView = React.forwardRef(
  (_, receivedRef: React.ForwardedRef<ClaimUsernameViewRefProps>) => {
    const navigation = useNavigation()
    const styles = useThemeAwareStyle(createStyles)
    const { theme } = useTheme()
    const [inputUsername, setInputUsername] = useState<string>('')

    const [processing, setProcessing] = useState<boolean>(false)
    const [, setClaimingUsername] = useState<boolean>(false)
    const [showRetry, setShowRetry] = useState<boolean>(false)
    const [isDoneCreateUsername, setDoneCreateUsername] =
      useState<boolean>(false)
    const [createUsernameErrorMessage, setCreateUsernameErrorMessage] =
      useState<string>('Please retry')

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
      } catch (error) {
        logger.error(error)
        if (error instanceof Error) {
          setCreateUsernameErrorMessage(error.message)
        }
        setShowRetry(true)
      } finally {
        setProcessing(false)
      }
    }

    return (
      <View key='ClaimUsername' style={styles.container}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: theme.spacing.xxl,
            paddingTop: theme.spacing.l,
            paddingHorizontal: theme.spacing.m,
          }}>
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
            {processing ? ( // TODO: Replace with StatusInfo
              <>
                <BlurCircle />
                <LottieView
                  source={require('~/assets/animations/dots-loader.json')}
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
        <BottomActionBar
          actions={
            showRetry
              ? [
                  {
                    label: 'Retry',
                    onPress: () => handleClaimUsername(inputUsername),
                  },
                ]
              : isDoneCreateUsername
                ? [
                    {
                      label: 'Done',
                      onPress: () => navigation.goBack(),
                    },
                  ]
                : []
          }
        />
      </View>
    )
  }
)

const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    dotsLoader: {
      width: 48,
      height: 48,
      position: 'absolute',
    },
    pagerView: {
      flex: 1,
    },
  })
