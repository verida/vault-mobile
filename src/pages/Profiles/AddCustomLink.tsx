import { useNavigation } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import { emitter } from 'helpers/emitter'
import { isEmpty } from 'lodash'
import React, { useState } from 'react'
import { Keyboard, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Snackbar from 'react-native-snackbar'

import ClipboardIcon from 'assets/clipboard_icon.svg'
import { FormInput } from 'components/Input/FormInput'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Screen from 'components/Screen'
import { Text } from 'components/Typography/Text'
import useParams from 'hooks/useParams'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

import Button from '../../components/Button'
import { DECLINE_COLOR } from '../../constants/color'
import { NUNITO_SANS, NUNITO_SANS_BOLD } from '../../constants/text'

const MAX_TEXTAREA_LENGTH = 255
const MAX_INPUT_LENGTH = 140

export interface GenericEditPropertyScreenProps {
  screenName: string
  title: string
  label: string
  url: string
  mode: string | number
  submitButtonLabel?: string
  verification?: {
    expectedValue: string
    errorMessage: string
  }
}

const AddCustomLink = () => {
  const navigation = useNavigation()
  const params = useParams<GenericEditPropertyScreenProps>()
  const {
    screenName,
    title,
    label,
    url,
    mode,
    submitButtonLabel = 'Save',
    verification,
  } = params
  const styles = useThemeAwareStyle(createStyles)
  const { bottom } = useSafeAreaInsets()

  const [disabled, setDisabled] = useState(false)

  const saveValue = async () => {
    try {
      const val = '' //(((edited as ValueObject)?.value || edited) as string).trim()
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
    // setEdited(text)
    // if (text.length >= maxLength) {
    //   setInputError({ inputMaxLength: maxLength, isExceededMaxLength: true })
    // } else {
    //   setInputError({ ...inputError, isExceededMaxLength: false })
    // }
  }

  const isEditMode = () => !isEmpty(label) && !isEmpty(url)

  return (
    <Screen>
      <NavigationHeader
        title={isEditMode() ? 'Edit Link' : 'Add New Link'}
        left={{
          icon: 'close',
        }}
      />
      <View style={[styles.constainer, { marginBottom: bottom }]}>
        <View style={{ flexDirection: 'column' }}>
          <FormInput label='Label' placeholder='Enter label' />
          <FormInput
            style={{ marginTop: 16 }}
            label='URL'
            placeholder='Enter URL'
          />

          <Button color='transparent-link'>
            <View style={styles.clipboardPasteButton}>
              <ClipboardIcon />
              <Text style={styles.clipboardPasteButtonText}>
                Paste from clipboard
              </Text>
            </View>
          </Button>
        </View>
        <Button onPress={saveValue}>{submitButtonLabel}</Button>
      </View>
    </Screen>
  )
}

export default AddCustomLink

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    constainer: {
      flex: 1,
      paddingHorizontal: theme.spacing.m,
      paddingTop: theme.spacing.m,
      justifyContent: 'space-between',
    },
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
    clipboardPasteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.s,
    },
    clipboardPasteButtonText: {
      color: theme.color.primary,
      marginLeft: theme.spacing.sm,
      fontFamily: NUNITO_SANS_BOLD,
    },
  })
