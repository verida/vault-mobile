import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Image, Keyboard, ScrollView, StyleSheet, View } from 'react-native'
import PagerView from 'react-native-pager-view'
import Snackbar from 'react-native-snackbar'

import UsernameManager from '~/api/UsernameManager'
import SuccessTick from '~/assets/success_tick.svg'
import { BottomActionBar, ScreenWrapper } from '~/components'
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

  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()
  const [currentPage, setCurrentPage] = useState<PageType>(
    PageType.UnlockVeridaOne
  )
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

          <BottomActionBar
            actions={[
              {
                disabled: !invitationCode,
                label: 'Submit',
                onPress: submitVeridaOneInvitationCode,
              },
            ]}
          />
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

          <BottomActionBar
            actions={[
              {
                label: 'Next',
                onPress: handleVeridaOneInviationComplete,
              },
            ]}
          />
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
                source={require('~/assets/blur_circle_big.png')}
                style={{ position: 'absolute' }}
              />
              <Image
                resizeMode='cover'
                source={require('~/assets/username_placehoder.png')}
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

          <BottomActionBar
            actions={[
              {
                variant: 'secondary',
                label: 'Claim Later',
                onPress: () => navigation.goBack,
              },
              {
                label: 'Claim Now',
                onPress: () => {
                  pagerRef.current?.setPage(PageType.InputUsername)
                  setTimeout(() => {
                    inputUsernameViewRef.current?.focusInput()
                  }, 400)
                },
              },
            ]}
          />
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

const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    dotsLoader: {
      width: 48,
      height: 48,
      position: 'absolute',
    },
    pagerView: {
      flex: 1,
    },
  })
