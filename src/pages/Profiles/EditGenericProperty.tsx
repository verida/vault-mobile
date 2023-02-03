import { useNavigation } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import { emitter } from 'helpers/emitter'
import { Container, Content } from 'native-base'
import React, { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import useParams from 'hooks/useParams'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

import Button from '../../components/Button'
import Label from '../../components/Label'
import DropDownPicker from '../../components/Select'
import { DECLINE_COLOR } from '../../constants/color'
import { NUNITO_SANS } from '../../constants/text'
import { COUNTRIES } from '../../helpers/country-list'
import InputStyles from '../../styles/inputs'

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
    description: string
  }
  originalValue: any
  mode: string
}

type ValueObject = {
  value: string
}

/**
 * This component is just duplicated and modified for generic purpose usage from the EditProfile.tsx component
 * TODO: Refactor
 */
const EditGenericProperty = () => {
  const navigation = useNavigation()
  const params = useParams<GenericEditPropertyScreenProps>()
  const { screenName, title, option, mode, originalValue } = params
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
      <NavigationHeader title={title} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <Content
          contentContainerStyle={{
            flex: 1,
            margin: 20,
            justifyContent: 'space-between',
          }}>
          <View style={{ flex: 1 }}>
            <Label>{option.label}</Label>
            {option.type === 'input' && (
              <TextInput
                placeholder={option.placeholder}
                style={[
                  InputStyles.input,
                  inputError.isExceededMaxLength && styles.inputValidation,
                ]}
                value={edited as string}
                autoFocus={true}
                placeholderTextColor='rgba(4, 17, 51, 0.3)'
                maxLength={MAX_INPUT_LENGTH}
                onChangeText={(text) => {
                  handleInput(text, MAX_INPUT_LENGTH)
                }}
              />
            )}
            {option.type === 'select' && (
              <DropDownPicker
                searchable={true}
                searchablePlaceholder='Search...'
                placeholder=''
                defaultValue={option.value as string}
                items={COUNTRIES}
                containerStyle={InputStyles.select}
                onChangeItem={onChangeItem}
              />
            )}
            {option.type === 'textarea' && (
              <TextInput
                placeholder={`Enter the ${option.label}`}
                style={[
                  InputStyles.textarea,
                  inputError.isExceededMaxLength && styles.inputValidation,
                ]}
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
            {['textarea', 'input'].includes(option.type) &&
              inputError.isExceededMaxLength && (
                <Text style={styles.inputText}>
                  {option.type} must be less than {inputError.inputMaxLength}{' '}
                  characters
                </Text>
              )}
            <Text style={[styles.description]}>{option.description}</Text>
          </View>
          <Button
            disabled={disabled || (edited as string).length === 0}
            onPress={saveValue}>
            Save
          </Button>
        </Content>
      </KeyboardAvoidingView>
    </Container>
  )
}

export default EditGenericProperty

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
