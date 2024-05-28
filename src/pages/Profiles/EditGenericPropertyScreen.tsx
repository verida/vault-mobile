import React, { useEffect, useState } from 'react'
import { Keyboard, StyleSheet, Text, View } from 'react-native'
import Snackbar from 'react-native-snackbar'

import { BottomActionBar, ScreenWrapper } from '~/components'
import { FormInput } from '~/components/Input/FormInput'
import Label from '~/components/Label'
import DropDownPicker from '~/components/Select'
import { DECLINE_COLOR } from '~/constants/color'
import { NUNITO_SANS } from '~/constants/text'
import { Logger } from '~/features/telemetry'
import { COUNTRIES } from '~/helpers/countries'
import { emitter } from '~/helpers/emitter'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps } from '~/navigation'
import InputStyles from '~/styles/inputs'
import { Theme } from '~/styles/types'

const logger = Logger.create('Pages/Profiles/EditGenericProperty')

const MAX_TEXTAREA_LENGTH = 255
const MAX_INPUT_LENGTH = 140

export type GenericEditPropertyScreenParams = {
  screenName: string
  title: string
  option: {
    label: string
    value: string | Record<string, any> | undefined
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

type EditGenericPropertyScreenProps =
  MainStackScreenProps<'EditGenericProperty'>

type ValueObject = {
  value: string
}

/**
 * This component is just duplicated and modified for generic purpose usage from the EditProfile.tsx component
 * TODO: Refactor
 */
export const EditGenericPropertyScreen: React.FC<
  EditGenericPropertyScreenProps
> = (props) => {
  const {
    navigation,
    route: { params },
  } = props
  const {
    screenName,
    title,
    option,
    mode,
    originalValue,
    submitButtonLabel = 'Save',
    verification,
  } = params

  useEffect(() => {
    navigation.setOptions({
      title,
    })
  }, [navigation, title])

  const styles = useThemeAwareStyle(createStyles)

  const [disabled, setDisabled] = useState(false)
  const [edited, setEdited] = useState<string | ValueObject>(
    option.value as any
  )
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
      logger.error(error)
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
    <ScreenWrapper isModal keyboardAvoiding>
      <View style={styles.container}>
        {option.type === 'input' && (
          <FormInput
            placeholder={option.placeholder}
            label={option.label}
            value={edited as string}
            autoFocus={true}
            autoCapitalize='none'
            autoCorrect={false}
            errorMessage={
              inputError.isExceededMaxLength
                ? `${option.type} must be less than ${inputError.inputMaxLength} characters`
                : undefined
            }
            placeholderTextColor='rgba(4, 17, 51, 0.3)'
            maxLength={MAX_INPUT_LENGTH}
            onChangeText={(text) => {
              handleInput(text, MAX_INPUT_LENGTH)
            }}
          />
        )}
        {option.type === 'select' && (
          <>
            <Label style={{ marginTop: 0 }}>{option.label}</Label>
            <DropDownPicker
              searchable={true}
              searchablePlaceholder='Search...'
              placeholder=''
              defaultValue={option.value as string}
              items={COUNTRIES}
              containerStyle={InputStyles.select}
              onChangeItem={onChangeItem}
            />
          </>
        )}
        {option.type === 'textarea' && (
          <FormInput
            placeholder={`Enter the ${option.label}`}
            label={option.label}
            inputStyle={{ minHeight: 68 }}
            value={edited as string}
            multiline
            numberOfLines={4}
            maxLength={MAX_TEXTAREA_LENGTH}
            editable
            autoFocus={true}
            onChangeText={(text) => {
              handleInput(text, MAX_TEXTAREA_LENGTH)
            }}
          />
        )}
        {Boolean(option.description) && (
          <Text style={[styles.description]}>{option.description}</Text>
        )}
      </View>
      <BottomActionBar
        actions={[
          {
            label: submitButtonLabel,
            onPress: saveValue,
            disabled:
              disabled ||
              (edited as string).length === 0 ||
              inputError.isExceededMaxLength,
          },
        ]}
      />
    </ScreenWrapper>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.m,
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
  })
