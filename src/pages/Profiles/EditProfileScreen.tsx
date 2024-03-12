import { selectSelectedAccount } from 'features/identities'
import {
  PublicProfile,
  selectSelectedPublicProfile,
  setPublicProfileByDid,
} from 'features/profiles'
import { Logger } from 'features/telemetry'
import { COUNTRIES } from 'helpers/countries'
import { emitter } from 'helpers/emitter'
import { Container, Content } from 'native-base'
import React, { useState } from 'react'
import { Keyboard, KeyboardAvoidingView, Platform, View } from 'react-native'

import AccountManager from 'api/AccountManager'
import { FormInput } from 'components/Input/FormInput'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { MainStackScreenProps } from 'navigation/types'
import { useAppDispatch, useAppSelector } from 'reduxStore/types'

import Button from '../../components/Button'
import Label from '../../components/Label'
import DropDownPicker from '../../components/Select'
import InputStyles from '../../styles/inputs'

const logger = Logger.create('Pages/Profiles/EditProfile')

/**
 * Take from the schema, better to fetch them dynamic
 * https://common.schemas.verida.io/profile/basicProfile/v0.1.0/schema.json
 */
const MAX_TEXTAREA_LENGTH = 140
const MAX_INPUT_LENGTH = 140

export type EditProfilePropertyOption = {
  label: string
  key: keyof PublicProfile
  value: string
  action: 'arrow' | 'copy'
  type: 'input' | 'textarea' | 'select'
}

export type EditProfileScreenParams = {
  title: string
  option: EditProfilePropertyOption
}

type EditProfileScreenProps = MainStackScreenProps<'EditProfile'>

export const EditProfileScreen: React.FC<EditProfileScreenProps> = (props) => {
  const {
    navigation,
    route: { params },
  } = props
  const { title, option } = params

  const dispach = useAppDispatch()
  const selectedAccount = useAppSelector(selectSelectedAccount)
  const publicProfileData = useAppSelector(selectSelectedPublicProfile)

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
      const key = option.key
      const val = edited.trim()

      if (publicProfileData[key] !== val) {
        setDisabled(true)
        const vault = AccountManager.getInstance().vault as any
        await vault.profiles.public.set(key, val.length === 0 ? undefined : val) // Must be undefined to clear out the field

        dispach(
          setPublicProfileByDid({
            did: selectedAccount!.did!,
            publicProfile: { ...publicProfileData, [key]: val },
          })
        )
        emitter.emit('UPDATE_PUBLIC_PROFILE', undefined)
      }
    } catch (error) {
      logger.error(error)
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
                autoCapitalize='none'
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
