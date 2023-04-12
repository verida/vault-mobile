import { useNavigation } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import Color from 'color'
import { useTheme } from 'contexts/ThemeContext'
import { emitter } from 'helpers/emitter'
import { Container, Content } from 'native-base'
import React, { useRef, useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'
import ParsedText from 'react-native-parsed-text'
import Snackbar from 'react-native-snackbar'

import { FormInput } from 'components/Input/FormInput'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { Headline } from 'components/Typography/Headline'
import { Text } from 'components/Typography/Text'
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
  const onChangeItem = (e: any) => setEdited(e)

  const saveValue = async () => {
    try {
      const val = (((edited as ValueObject)?.value || edited) as string).trim()
      setDisabled(true)
      Keyboard.dismiss()

      // Allow to retry
      if (
        verification &&
        verification.expectedValue.toLowerCase() !== val?.trim().toLowerCase()
      ) {
        setTimeout(() => {
          Snackbar.show({
            text: verification.errorMessage,
            duration: Snackbar.LENGTH_LONG,
          })
        }, 100)

        setDisabled(false)

        return
      }

      emitter.emit('SAVE_GENERIC_PROPERTY', {
        screenName,
        title,
        value: val,
        mode,
        originalValue,
      })

      navigation.goBack()
    } catch (error) {
      Sentry.captureException(error)
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

  return (
    <Container>
      <NavigationHeader title={'Username'} left={{ icon: 'close' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <Content
          contentContainerStyle={{
            flex: 1,
            paddingTop: theme.spacing.l,
            paddingHorizontal: theme.spacing.m,
            justifyContent: 'space-between',
          }}>
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
              autoCapitalize='none'
              autoCorrect={false}
              maxLength={MAX_INPUT_LENGTH}
              onSelectionChange={(e) => {
                const selection = e.nativeEvent.selection
                let start, end
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

                usernameInputRef.current?.setNativeProps({
                  selection: {
                    start,
                    end,
                  },
                })
              }}
              onChangeText={(text) => {
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
          <Button
            disabled={
              disabled ||
              (edited as string).length === 0 ||
              inputError.isExceededMaxLength
            }
            onPress={saveValue}>
            {submitButtonLabel}
          </Button>
        </Content>
      </KeyboardAvoidingView>
    </Container>
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
  })
