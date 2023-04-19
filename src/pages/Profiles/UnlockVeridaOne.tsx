import { useNavigation } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import { useTheme } from 'contexts/ThemeContext'
import { emitter } from 'helpers/emitter'
import { checkVeridaOneInviteCode } from 'helpers/profile'
import React, { useEffect, useRef, useState } from 'react'
import { Image, Keyboard, ScrollView, StyleSheet, View } from 'react-native'
import PagerView from 'react-native-pager-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Snackbar from 'react-native-snackbar'

import UsernameManager from 'api/UsernameManager'
import SuccessTick from 'assets/success_tick.svg'
import Container from 'components/Container'
import { FormInput } from 'components/Input/FormInput'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Screen from 'components/Screen'
import { Headline } from 'components/Typography/Headline'
import { Text } from 'components/Typography/Text'
import ClaimUsernamePage, {
  ClaimUsernamePageRefProps,
} from 'components/Username/ClaimUsernamePage'
import InputUsernamePage, {
  InputUsernamePageRefProps,
} from 'components/Username/InputUsernamePage'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

import Button from '../../components/Button'

enum PageType {
  UnlockVeridaOne,
  InvitationSuccess,
  SuggestClaimUsername,
  InputUsername,
  ClaimUsername,
}

const UnlockVeridaOne = () => {
  const navigation = useNavigation()
  const { bottom, top } = useSafeAreaInsets()
  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()
  const [currentPage] = useState(PageType.UnlockVeridaOne)
  const pagerRef = useRef<PagerView>(null)
  const inputUsernamePageRef = useRef<InputUsernamePageRefProps>(null)
  const claimUsernamePageRef = useRef<ClaimUsernamePageRefProps>(null)

  const [invitationCode, setInvitationCode] = useState<string>()
  const [username, setUsername] = useState<string | undefined>(undefined)

  const fetchUsername = async () => {
    try {
      const accountUsernames = await UsernameManager.get()
      if (accountUsernames && accountUsernames?.length > 0) {
        setUsername(accountUsernames[0])
      }
    } catch (e) {
      Sentry.captureException(e)
    }
  }

  const getPageName = () => {
    switch (currentPage) {
      case PageType.UnlockVeridaOne:
      case PageType.InvitationSuccess:
        return 'Invitation Code'
      case PageType.SuggestClaimUsername:
        return 'Claim your username'
      case PageType.InputUsername:
      case PageType.ClaimUsername:
        return 'Username'
    }
  }

  const submitVeidaOneInvitationCode = () => {
    Keyboard.dismiss()
    if (checkVeridaOneInviteCode(invitationCode!)) {
      emitter.emit('UNLOCK_VERIDA_ONE', undefined)
      pagerRef.current?.setPage(PageType.InvitationSuccess)
    } else {
      Snackbar.show({
        duration: Snackbar.LENGTH_SHORT,
        text: 'Wrong code, please try again!',
      })
    }
  }

  const handleVeridaOneInviationComplete = () => {
    if (username) {
      navigation.goBack()
    } else {
      pagerRef.current?.setPage(PageType.SuggestClaimUsername)
    }
  }

  useEffect(() => {
    fetchUsername()
  }, [])

  return (
    <Screen
      navBar={
        <NavigationHeader title={getPageName()} left={{ icon: 'close' }} />
      }>
      <PagerView
        style={styles.pagerView}
        initialPage={currentPage}
        scrollEnabled={false}
        ref={pagerRef}>
        {/* UnlockVeridaOne */}
        <Container
          key='UnlockVeridaOne'
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
            <View style={{ flex: 1 }}>
              <FormInput
                placeholder={'Enter your code'}
                label={'Invitation code'}
                autoFocus
                autoCorrect={false}
                autoComplete='off'
                autoCapitalize='none'
                returnKeyType='done'
                onSubmitEditing={submitVeidaOneInvitationCode}
                value={invitationCode}
                onChangeText={(text) => setInvitationCode(text)}
              />
            </View>
          </ScrollView>

          <View style={[styles.bottomNavContainer, { marginBottom: bottom }]}>
            <Button
              disabled={!invitationCode}
              style={styles.button}
              onPress={submitVeidaOneInvitationCode}>
              Submit
            </Button>
          </View>
        </Container>

        {/* InvitationSuccess */}
        <Container key='InvitationSuccess'>
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
              <SuccessTick />
            </View>
            <Headline
              style={{
                alignSelf: 'center',
                fontSize: 28,
                marginBottom: theme.spacing.sm,
              }}>
              Invitation confirmed
            </Headline>
            <Text
              style={[
                {
                  alignSelf: 'center',
                  fontSize: theme.fontSize.l,
                  color: theme.color.textLightGrey,
                },
              ]}>
              You now have access to Verida One
            </Text>
          </ScrollView>
          <View style={[styles.bottomNavContainer, { marginBottom: bottom }]}>
            <Button
              style={styles.button}
              onPress={handleVeridaOneInviationComplete}>
              Next
            </Button>
          </View>
        </Container>

        {/* SuggestClaimUsername */}
        <Container key='SuggestClaimUsername'>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: theme.spacing.xxl,
              paddingTop: theme.spacing.l,
              paddingHorizontal: theme.spacing.m,
            }}>
            <View
              style={{
                width: 216,
                height: 216,
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                marginTop: 56,
                marginBottom: theme.spacing.xl,
              }}>
              <Image
                resizeMode='cover'
                source={require('assets/blur_circle_big.png')}
                style={{ position: 'absolute' }}
              />
              <Image
                resizeMode='cover'
                source={require('assets/username_placehoder.png')}
                style={{ position: 'absolute', width: 177, height: 189 }}
              />
            </View>
            <Headline
              style={{
                alignSelf: 'center',
                fontSize: 28,
                marginBottom: theme.spacing.sm,
              }}>
              Claim your username
            </Headline>
            <Text
              style={[
                {
                  alignSelf: 'center',
                  fontSize: theme.fontSize.l,
                  color: theme.color.textLightGrey,
                },
              ]}>
              You now have access to Verida One
            </Text>
          </ScrollView>
          <View style={[styles.bottomNavContainer, { marginBottom: bottom }]}>
            <Button
              color='transparent-border'
              style={styles.button}
              onPress={() => navigation.goBack()}>
              Claim Later
            </Button>
            <Button
              style={styles.button}
              onPress={() => {
                pagerRef.current?.setPage(PageType.InputUsername)
                setTimeout(() => {
                  inputUsernamePageRef.current?.focusInput()
                }, 400)
              }}>
              Claim Now
            </Button>
          </View>
        </Container>

        {/* InputUsername */}
        <InputUsernamePage
          ref={inputUsernamePageRef}
          onClaimUsername={(newUsername) => {
            pagerRef.current?.setPage(PageType.ClaimUsername)
            claimUsernamePageRef.current?.claimUsername(newUsername)
          }}
        />

        {/* ClaimUsername */}
        <ClaimUsernamePage ref={claimUsernamePageRef} />
      </PagerView>
    </Screen>
  )
}

export default UnlockVeridaOne

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
