import { useNavigation } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import Color from 'color'
import { useTheme } from 'contexts/ThemeContext'
import LottieView from 'lottie-react-native'
import React, { useCallback, useRef, useState } from 'react'
import { ScrollView, StyleSheet, TextInput, View } from 'react-native'
import ParsedText from 'react-native-parsed-text'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import UsernameManager from 'api/UsernameManager'
import BlurCircle from 'assets/blur-circle.svg'
import FailureCross from 'assets/failure_cross.svg'
import SuccessTick from 'assets/success_tick.svg'
import Container from 'components/Container'
import { FormInput } from 'components/Input/FormInput'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Screen from 'components/Screen'
import { Headline } from 'components/Typography/Headline'
import { Text } from 'components/Typography/Text'
import { Title } from 'components/Typography/Title'
import useParams from 'hooks/useParams'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

import Button from '../../components/Button'
import { DECLINE_COLOR } from '../../constants/color'
import { NUNITO_SANS } from '../../constants/text'

const MAX_TEXTAREA_LENGTH = 255
const MAX_INPUT_LENGTH = 140

export interface GenericEditPropertyScreenProps {
  screenName: string
  title: string
  option: {
    label: string
    value: string | Record<string, any>
    type: 'input' | 'select' | 'textarea'
    placeholder: string
    description?: string
  }
  originalValue: any
  mode: string | number
  submitButtonLabel?: string
  verification?: {
    expectedValue: string
    errorMessage: string
  }
}

type ValueObject = {
  value: string
}

/**
 * This component is just duplicated and modified for generic purpose usage from the EditProfile.tsx component
 * TODO: Refactor
 */
const ClaimUsername = () => {
  const navigation = useNavigation()
  const params = useParams<GenericEditPropertyScreenProps>()
  const { top, bottom } = useSafeAreaInsets()
  const {
    screenName,
    title,
    // option,
    mode,
    originalValue,
    submitButtonLabel = 'Claim',
    verification,
  } = params
  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()

  const [disabled, setDisabled] = useState(false)
  const [edited, setEdited] = useState<string | ValueObject>('')
  const [inputText, setInputText] = useState('')
  const usernameInputRef = useRef<TextInput>(null)
  const [inputError, setInputError] = useState({
    inputMaxLength: 0,
    isExceededMaxLength: false,
  })

  const [processing, setProcessing] = useState(false)
  const [claimingUsername, setClaimingUsername] = useState(false)
  const [showRetry, setShowRetry] = useState(false)
  const [isDoneCreateAccount, setDoneCreateAccount] = useState(false)
  const [createAccountErrorMessage, setCreateAccountErrorMessage] =
    useState('Please retry')
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [availableUsername, setAvailableUsername] = useState(false)
  const [usernameError, setUsernameError] = useState<string | undefined>(
    undefined
  )

  const onChangeItem = (e: any) => setEdited(e)

  const saveValue = async () => {
    try {
      setShowRetry(false)
      setProcessing(true)
      setClaimingUsername(true)
      const usernameManager = new UsernameManager()
      // FIXME: Need an API for checking username is available to claim
      await usernameManager.set(inputText)

      const username = await usernameManager.get()
      console.log('username', username)
      setDoneCreateAccount(true)
    } catch (error) {
      Sentry.captureException(error)
      setShowRetry(true)
    } finally {
      setCheckingUsername(false)
      setProcessing(false)
    }
  }

  const handleInput = (text: string, maxLength: number) => {
    setEdited(text)
    if (text.length >= maxLength) {
      setInputError({ inputMaxLength: maxLength, isExceededMaxLength: true })
    } else {
      setInputError({ ...inputError, isExceededMaxLength: false })
    }
  }

  const ensureSelctionPosition = (selection?: {
    start: number
    end: number
  }) => {
    console.log('selection', selection, inputText)
    let start, end
    if (!selection) {
      start = inputText.length - 4
      end = start
    } else {
      if (selection.start > inputText.length - 4) {
        start = inputText.length - 4
      } else {
        start = selection.start
      }

      if (selection.end > inputText.length - 4) {
        end = inputText.length - 4
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
    if (inputText.length < 4) return
    const usernameManager = new UsernameManager()
    // FIXME: Need an API for checking username is available to claim
    setCheckingUsername(true)
    const isValid = await usernameManager.usernameExists(inputText)
    console.log('inputText', inputText, isValid)
    setAvailableUsername(isValid)
    setCheckingUsername(false)
  }, [inputText])

  return (
    <Screen
      navBar={<NavigationHeader title={'Username'} left={{ icon: 'close' }} />}>
      <Container
        withKeyboardAvoidingView
        keyboadAvoidingViewProps={{ keyboardVerticalOffset: 60 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: theme.spacing.xxl,
            paddingTop: theme.spacing.l,
            paddingHorizontal: theme.spacing.m,
          }}>
          {claimingUsername ? (
            <>
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
                ) : isDoneCreateAccount ? (
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
                {isDoneCreateAccount
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
                {isDoneCreateAccount
                  ? `You successfully claimed username`
                  : showRetry
                  ? createAccountErrorMessage
                  : 'Please wait...'}
              </Text>
              {isDoneCreateAccount && (
                <Title
                  style={{
                    alignSelf: 'center',
                    color: theme.color.textLightGrey,
                    fontWeight: 'bold',
                  }}>
                  {inputText}
                </Title>
              )}
            </>
          ) : (
            <View style={{ flex: 1 }}>
              <Headline style={{ marginBottom: 10 }}>Username</Headline>
              <Text style={{ marginBottom: theme.spacing.l }}>
                Your username is unique to your identity.
              </Text>
              <FormInput
                ref={usernameInputRef}
                placeholder={'veridaname.vda'}
                label={'Username'}
                desciption='Your username is public and optional'
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
                onSubmitEditing={() => checkUsername()}
                onBlur={() => {
                  checkUsername()
                }}
                maxLength={MAX_INPUT_LENGTH}
                onFocus={() => {
                  ensureSelctionPosition(undefined)
                }}
                onSelectionChange={(e) => {
                  ensureSelctionPosition(e.nativeEvent.selection)
                }}
                onChangeText={(value) => {
                  const text = value.replace(/\s/g, '')
                  if (text.length > 0 && !text.match(/.vda$/)) {
                    setInputText(text + '.vda')
                  } else if (text === '.vda') {
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
                      pattern: /.vda$/,
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
          )}
        </ScrollView>

        <View style={[styles.bottomNavContainer, { marginBottom: bottom }]}>
          {!claimingUsername ? (
            <Button
              disabled={
                disabled ||
                (inputText as string).length === 0 ||
                inputError.isExceededMaxLength
              }
              style={styles.button}
              onPress={saveValue}>
              {submitButtonLabel}
            </Button>
          ) : showRetry ? (
            <Button style={styles.button} onPress={saveValue}>
              Retry
            </Button>
          ) : isDoneCreateAccount ? (
            <Button style={styles.button} onPress={() => navigation.goBack()}>
              Done
            </Button>
          ) : null}
        </View>
      </Container>
    </Screen>
  )
}

export default ClaimUsername

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    inputValidation: {
      borderColor: DECLINE_COLOR,
    },
    inputText: {
      fontFamily: NUNITO_SANS,
      color: DECLINE_COLOR,
      fontStyle: 'italic',
      fontSize: 12,
      marginVertical: 4,
    },
    description: {
      marginVertical: theme.spacing.xs,
      color: theme.color.textLightGrey,
      fontSize: theme.fontSize.s,
    },
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
  })
