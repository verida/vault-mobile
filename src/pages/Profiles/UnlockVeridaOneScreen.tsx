import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Image, Keyboard, ScrollView, StyleSheet, View } from 'react-native'
import PagerView from 'react-native-pager-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Snackbar from 'react-native-snackbar'

import UsernameManager from '~/api/UsernameManager'
import SuccessTick from '~/assets/success_tick.svg'
import { ScreenWrapper } from '~/components'
import Button from '~/components/Button'
import Container from '~/components/Container'
import { FormInput } from '~/components/Input/FormInput'
import {
  ClaimUsernameView,
  ClaimUsernameViewRefProps,
  InputUsernameView,
  InputUsernameViewRefProps,
} from '~/components/PublicProfile'
import { Headline } from '~/components/Typography/Headline'
import { Text } from '~/components/Typography/Text'
import { useTheme } from '~/contexts'
import {
  saveVeridaOneStatus,
  verifyVeridaOneInviteCode,
} from '~/features/veridaOne'
import { emitter } from '~/helpers/emitter'
import { useThemeAwareStyle } from '~/hooks/useThemeAwareStyle'
import { MainStackScreenProps } from '~/navigation'
import { Theme } from '~/styles/types'

enum PageType {
  UnlockVeridaOne,
  InvitationSuccess,
  SuggestClaimUsername,
  InputUsername,
  ClaimUsername,
}

export type UnlockVeridaOneScreenParams = {
  initialPage?: number
}

type UnlockVeridaOneScreenProps = MainStackScreenProps<'UnlockVeridaOne'>

export const UnlockVeridaOneScreen: React.FC<UnlockVeridaOneScreenProps> = (
  props
) => {
  const { navigation } = props

  const { bottom } = useSafeAreaInsets()
  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()
  const [currentPage, setCurrentPage] = useState(PageType.UnlockVeridaOne)
  const pagerRef = useRef<PagerView>(null)
  const inputUsernameViewRef = useRef<InputUsernameViewRefProps>(null)
  const claimUsernameViewRef = useRef<ClaimUsernameViewRefProps>(null)

  const [invitationCode, setInvitationCode] = useState<string>()
  const [username, setUsername] = useState<string | undefined>(undefined)

  const getPageName = useCallback(() => {
    switch (currentPage) {
      case PageType.UnlockVeridaOne:
      case PageType.InvitationSuccess:
        return 'Invitation Code'
      case PageType.SuggestClaimUsername:
        return 'Claim your Username'
      case PageType.InputUsername:
      case PageType.ClaimUsername:
        return 'Username'
    }
  }, [currentPage])

  useEffect(() => {
    navigation.setOptions({
      title: getPageName(),
    })
  }, [navigation, getPageName])

  const fetchUsername = useCallback(async () => {
    const accountUsernames = await UsernameManager.get()
    if (accountUsernames?.length > 0) {
      setUsername(accountUsernames[0])
    }
  }, [])

  const submitVeridaOneInvitationCode = useCallback(() => {
    Keyboard.dismiss()
    if (verifyVeridaOneInviteCode(invitationCode!)) {
      saveVeridaOneStatus(true)
      emitter.emit('UNLOCK_VERIDA_ONE', undefined)
      pagerRef.current?.setPage(PageType.InvitationSuccess)
    } else {
      Snackbar.show({
        duration: Snackbar.LENGTH_SHORT,
        text: 'Wrong code, please try again!',
      })
    }
  }, [invitationCode])

  const handleVeridaOneInviationComplete = useCallback(() => {
    if (username) {
      navigation.goBack()
    } else {
      pagerRef.current?.setPage(PageType.SuggestClaimUsername)
    }
  }, [navigation, username])

  useEffect(() => {
    fetchUsername()
  }, [fetchUsername])

  const bottomButtonsPadding = { marginBottom: bottom + theme.spacing.m }

  return (
    <ScreenWrapper isModal keyboardAvoiding>
      <PagerView
        // FIXME: bottom bar blink when the keyboard appears. Remove the footer button from within each Page and move it in a BottomActionBar at the same level as the PagerView.
        style={styles.pagerView}
        initialPage={currentPage}
        scrollEnabled={false}
        onPageSelected={(e) => {
          setCurrentPage(e.nativeEvent.position)
        }}
        ref={pagerRef}>
        {/* UnlockVeridaOne */}
        <Container key='UnlockVeridaOne'>
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
                onSubmitEditing={submitVeridaOneInvitationCode}
                value={invitationCode}
                onChangeText={(text) => setInvitationCode(text)}
              />
            </View>
          </ScrollView>

          <View style={[styles.bottomNavContainer, bottomButtonsPadding]}>
            <Button
              disabled={!invitationCode}
              style={styles.button}
              onPress={submitVeridaOneInvitationCode}>
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
          <View style={[styles.bottomNavContainer, bottomButtonsPadding]}>
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
          <View style={[styles.bottomNavContainer, bottomButtonsPadding]}>
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
                  inputUsernameViewRef.current?.focusInput()
                }, 400)
              }}>
              Claim Now
            </Button>
          </View>
        </Container>

        {/* InputUsername */}
        <InputUsernameView
          ref={inputUsernameViewRef}
          onClaimUsername={(newUsername) => {
            pagerRef.current?.setPage(PageType.ClaimUsername)
            claimUsernameViewRef.current?.claimUsername(newUsername)
          }}
        />

        {/* ClaimUsername */}
        <ClaimUsernameView ref={claimUsernameViewRef} />
      </PagerView>
    </ScreenWrapper>
  )
}

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
