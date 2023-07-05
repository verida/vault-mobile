import * as Sentry from '@sentry/react-native'
import { emitter } from 'helpers/emitter'
import { Container, Content } from 'native-base'
import React, { useState } from 'react'
import { Keyboard, KeyboardAvoidingView, Platform, View } from 'react-native'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import AccountManager from 'api/AccountManager'
import { FormInput } from 'components/Input/FormInput'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { setPublicProfileData } from 'reduxStore/general/actions'

import Button from '../../components/Button'
import Label from '../../components/Label'
import DropDownPicker from '../../components/Select'
import { COUNTRIES } from '../../helpers/country-list'
import InputStyles from '../../styles/inputs'

/**
 * Take from the schema, better to fetch them dynamic
 * https://common.schemas.verida.io/profile/basicProfile/v0.1.0/schema.json
 */
const MAX_TEXTAREA_LENGTH = 140
const MAX_INPUT_LENGTH = 140

// TODO: Refactor this component
const EditProfile = (props: any) => {
  const { navigation, route, publicProfileData } = props
  const { title, option } = route.params

  const [disabled, setDisabled] = useState(false)
  const [edited, setEdited] = useState(option.value)
  const [inputError, setInputError] = useState<{
    inputMaxLength?: number
    isExceededMaxLength?: boolean
  }>({
    inputMaxLength: 0,
    isExceededMaxLength: false,
  })
  const onChangeItem = (e: any) => setEdited(e)

  const saveValue = async () => {
    Keyboard.dismiss()
    try {
      const key = title.toLowerCase()
      const val = (edited.value || edited).trim()

      if (publicProfileData[key] !== val) {
        setDisabled(true)
        const vault = AccountManager.getInstance().vault as any
        await vault.profiles.public.set(key, val.length === 0 ? undefined : val) // Must be undefined to clear out the field
        setPublicProfileData({ ...publicProfileData, [key]: val })
        emitter.emit('UPDATE_PUBLIC_PROFILE', undefined)
      }
    } catch (error) {
      Sentry.captureException(error)
    }

    navigation.goBack()
  }

  const handleInput = (text: string, maxLength: number) => {
    setEdited(text)
    const defaultValue = {
      inputMaxLength: maxLength,
      isExceededMaxLength: false,
    }
    if (text.length >= maxLength) {
      setInputError({
        ...defaultValue,
        isExceededMaxLength: true,
      })
    } else {
      setInputError({
        ...inputError,
        isExceededMaxLength: false,
      })
    }
  }

  return (
    <Container>
      <NavigationHeader title={title} left={{ icon: 'close' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <Content
          contentContainerStyle={{
            flex: 1,
            margin: 20,
            justifyContent: 'space-between',
          }}>
          <View style={{ flex: 1, paddingTop: 16 }}>
            {option.type === 'input' && (
              <FormInput
                placeholder={`Enter the ${option.label}`}
                label={option.label}
                value={edited}
                autoFocus={true}
                errorMessage={
                  inputError.isExceededMaxLength
                    ? `${option.label} must be less than ${inputError.inputMaxLength} characters`
                    : undefined
                }
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
                  defaultValue={option.value}
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
                value={edited}
                errorMessage={
                  inputError.isExceededMaxLength
                    ? `${option.label} must be less than ${inputError.inputMaxLength} characters`
                    : undefined
                }
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
            {/* {option.type === 'phone' && (
            <IntlPhoneInput
              // ref={el => setPhoneInputRef(el)}
              containerStyle={{ ...InputStyles.input, paddingVertical: 4 }}
              onChangeText={onChangeItem}
              defaultCountry='SG'
            />
          )} */}
          </View>
          <Button
            disabled={disabled || inputError.isExceededMaxLength}
            onPress={saveValue}>
            Save Changes
          </Button>
        </Content>
      </KeyboardAvoidingView>
    </Container>
  )
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setPublicProfileData: (data: unknown) =>
      dispatch(setPublicProfileData(data)),
  }
}

const mapStateToProps = (state: any) => {
  return { publicProfileData: state.main.publicProfileData }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditProfile)
