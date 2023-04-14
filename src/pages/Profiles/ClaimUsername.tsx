import { useNavigation } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import Color from 'color'
import { useTheme } from 'contexts/ThemeContext'
import { emitter } from 'helpers/emitter'
import LottieView from 'lottie-react-native'
import React, { useCallback, useRef, useState } from 'react'
import { ScrollView, StyleSheet, TextInput, View } from 'react-native'
import PagerView from 'react-native-pager-view'
import ParsedText from 'react-native-parsed-text'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import UsernameManager from 'api/UsernameManager'
import BlurCircle from 'assets/blur_circle.svg'
import FailureCross from 'assets/failure_cross.svg'
import SuccessTick from 'assets/success_tick.svg'
import Container from 'components/Container'
import { FormInput } from 'components/Input/FormInput'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Screen from 'components/Screen'
import { Headline } from 'components/Typography/Headline'
import { Text } from 'components/Typography/Text'
import { Title } from 'components/Typography/Title'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

import Button from '../../components/Button'
import { NUNITO_SANS } from '../../constants/text'

const MIN_INPUT_LENGTH = 2
const MAX_INPUT_LENGTH = 32

const VERIDA_NAME_SUFFIX = '.vda'
const VERIDA_NAME_PATTERN = /\.vda$/
const VERIDA_NAME_SUFFIX_LENGTH = VERIDA_NAME_SUFFIX.length

enum PageType {
  InputUsername,
  ClaimUsername,
}

const ClaimUsername = () => {
  const navigation = useNavigation()
  const { bottom, top } = useSafeAreaInsets()
  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()
  const [currentPage] = useState(PageType.InputUsername)
  const pagerRef = useRef<PagerView>(null)

  const [inputText, setInputText] = useState('')
  const usernameInputRef = useRef<TextInput>(null)

  const [processing, setProcessing] = useState(false)
  const [, setClaimingUsername] = useState(false)
  const [showRetry, setShowRetry] = useState(false)
  const [isDoneCreateUsername, setDoneCreateUsername] = useState(false)
  const [createUsernameErrorMessage, setCreateUsernameErrorMessage] =
    useState('Please retry')
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [availableUsername, setAvailableUsername] = useState(false)
  const [usernameError, setUsernameError] = useState<string | undefined>(
    undefined
  )

  const handleClaimUsername = async () => {
    pagerRef.current?.setPage(currentPage + 1)
    try {
      setShowRetry(false)
      setProcessing(true)
      setClaimingUsername(true)
      const usernameManager = new UsernameManager()
      await usernameManager.set(inputText)
      setDoneCreateUsername(true)
      emitter.emit('UPDATE_PROFILE_USERNAME', {})
    } catch (error: any) {
      Sentry.captureException(error)
      setCreateUsernameErrorMessage(error.message)
      setShowRetry(true)
    } finally {
      setCheckingUsername(false)
      setProcessing(false)
    }
  }

  const ensureSelectionPosition = (selection?: {
    start: number
    end: number
  }) => {
    let start, end
    if (!selection) {
      start = inputText.length - VERIDA_NAME_SUFFIX_LENGTH
      end = start
    } else {
      if (selection.start > inputText.length - VERIDA_NAME_SUFFIX_LENGTH) {
        start = inputText.length - VERIDA_NAME_SUFFIX_LENGTH
      } else {
        start = selection.start
      }

      if (selection.end > inputText.length - VERIDA_NAME_SUFFIX_LENGTH) {
        end = inputText.length - VERIDA_NAME_SUFFIX_LENGTH
      } else {
        end = selection.end
      }
    }

    usernameInputRef.current?.setNativeProps({
      selection: {
        start,
        end,
      },
    })
  }

  const checkUsername = useCallback(async () => {
    try {
      const plainName = inputText.replace(VERIDA_NAME_PATTERN, '')
      if (plainName.length > 0 && plainName.length < MIN_INPUT_LENGTH) {
        setUsernameError(`Username length must be >= ${MIN_INPUT_LENGTH}`)
        return
      } else if (plainName.length > MAX_INPUT_LENGTH) {
        setUsernameError(`Username length must be <= ${MAX_INPUT_LENGTH}`)
        return
      } else if (plainName.length === 0) {
        setUsernameError('')
        return
      }

      setCheckingUsername(true)
      const claimed = await UsernameManager.usernameExists(inputText)
      setAvailableUsername(!claimed)
      if (claimed) {
        setUsernameError('This username is already taken')
      }
    } catch (error) {
      setUsernameError('Unable to check the username')
    } finally {
      setCheckingUsername(false)
    }
  }, [inputText])

  return (
    <Screen
      navBar={<NavigationHeader title={'Username'} left={{ icon: 'close' }} />}>
      <PagerView
        style={styles.pagerView}
        initialPage={currentPage}
        scrollEnabled={false}
        ref={pagerRef}>
        <Container
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
              <Headline style={{ marginBottom: 10 }}>Username</Headline>
              <Text style={{ marginBottom: theme.spacing.l }}>
                Your username is unique to your identity.
              </Text>
              <FormInput
                ref={usernameInputRef}
                placeholder={`veridaname${VERIDA_NAME_SUFFIX}`}
                label={'Username'}
                desciption={
                  usernameError
                    ? undefined
                    : 'Your username is public and optional'
                }
                autoFocus={true}
                autoCorrect={false}
                withAnimatedChecbox
                autoComplete='username'
                autoCapitalize='none'
                keyboardType='url'
                returnKeyType='done'
                loading={checkingUsername}
                checked={availableUsername}
                errorMessage={usernameError}
                onBlur={checkUsername}
                maxLength={MAX_INPUT_LENGTH}
                onFocus={() => {
                  ensureSelectionPosition(undefined)
                }}
                onSelectionChange={(e) => {
                  ensureSelectionPosition(e.nativeEvent.selection)
                }}
                onChangeText={(value) => {
                  setUsernameError('')
                  const text = value.replace(/\s/g, '')
                  if (text.length > 0 && !text.match(VERIDA_NAME_PATTERN)) {
                    setInputText(text + VERIDA_NAME_SUFFIX)
                  } else if (text === VERIDA_NAME_SUFFIX) {
                    setInputText('')
                  } else {
                    setInputText(text)
                  }
                }}>
                <ParsedText
                  style={{
                    fontFamily: NUNITO_SANS,
                    fontSize: theme.fontSize.m,
                    color: theme.color.onBackground,
                  }}
                  parse={[
                    {
                      pattern: VERIDA_NAME_PATTERN,
                      style: {
                        fontFamily: NUNITO_SANS,
                        fontSize: theme.fontSize.m,
                        color: Color(theme.color.onBackground)
                          .alpha(0.4)
                          .toString(),
                      },
                    },
                  ]}>
                  {inputText}
                </ParsedText>
              </FormInput>
            </View>
          </ScrollView>

          <View style={[styles.bottomNavContainer, { marginBottom: bottom }]}>
            <Button
              disabled={Boolean(usernameError) || !availableUsername}
              style={styles.button}
              onPress={handleClaimUsername}>
              Claim
            </Button>
          </View>
        </Container>
        <Container
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
                {inputText}
              </Title>
            )}
          </ScrollView>

          <View style={[styles.bottomNavContainer, { marginBottom: bottom }]}>
            {showRetry ? (
              <Button style={styles.button} onPress={handleClaimUsername}>
                Retry
              </Button>
            ) : isDoneCreateUsername ? (
              <Button style={styles.button} onPress={() => navigation.goBack()}>
                Done
              </Button>
            ) : null}
          </View>
        </Container>
      </PagerView>
    </Screen>
  )
}

export default ClaimUsername

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
