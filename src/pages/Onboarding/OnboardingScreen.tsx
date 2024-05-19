import { LinearGradient } from 'expo-linear-gradient'
import React, { useCallback, useEffect } from 'react'
import { StatusBar, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Texture from '~/assets/landing-bg.svg'
import Logo from '~/assets/logo.svg'
import { Typography } from '~/components'
import { Button } from '~/components/Buttons'
import { useThemeAwareStyle } from '~/hooks'
import { AuthStackScreenProps } from '~/navigation/types'
import { Theme } from '~/styles/types'

export type OnboardingScreenParams = undefined

type OnboardingScreenProps = AuthStackScreenProps<'Onboarding'>

export const OnboardingScreen: React.FC<OnboardingScreenProps> = (props) => {
  const { navigation } = props

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    })
  }, [navigation])

  const insets = useSafeAreaInsets()

  const title = "Welcome!\nIt's time to own your personal data."

  const handleGetStartedButtonPress = useCallback(
    () =>
      navigation.navigate('AddIdentity', {
        firstIdentity: true,
      }),
    [navigation]
  )

  const styles = useThemeAwareStyle(createStyles)

  return (
    <>
      <StatusBar
        // It's a full screen with no header and a dark background
        barStyle='light-content'
        backgroundColor='transparent'
      />
      <LinearGradient
        colors={['#0E1572', '#1467CB', '#1995CB']}
        style={styles.backgroundGradient}>
        <Texture width={425} height={428} />
        <View
          style={[
            styles.container,
            {
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
              paddingLeft: insets.left,
              paddingRight: insets.right,
            },
          ]}>
          <View style={styles.content}>
            <Logo width={156} height={52} />
            <Typography variant='h1' style={styles.title}>
              {title}
            </Typography>
            <Button variant='secondary' onPress={handleGetStartedButtonPress}>
              Get Started
            </Button>
          </View>
        </View>
      </LinearGradient>
    </>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    backgroundGradient: {
      flex: 1,
    },
    container: {
      ...StyleSheet.absoluteFillObject,
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'space-between',
      paddingTop: theme.spacing.l,
      paddingBottom: theme.spacing.sm,
      paddingHorizontal: theme.spacing.m,
    },
    title: {
      color: theme.color.onPrimary,
    },
  })
