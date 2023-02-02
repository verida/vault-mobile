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
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

// import IntlPhoneInput from 'react-native-intl-phone-input'
import AccountManager from 'api/AccountManager'
import VeridaOneManager from 'api/VeridaOneManager'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { setPublicProfileData } from 'reduxStore/general/actions'

import Button from '../../components/Button'
import Label from '../../components/Label'
import DropDownPicker from '../../components/Select'
import { DECLINE_COLOR } from '../../constants/color'
import { NUNITO_SANS } from '../../constants/text'
import { COUNTRIES } from '../../helpers/country-list'
import InputStyles from '../../styles/inputs'

const MAX_TEXTAREA_LENGTH = 255
const MAX_INPUT_LENGTH = 20

const EditProfile = (props: any) => {
  const { navigation, route, publicProfileData } = props
  const { title, option } = route.params

  const [disabled, setDisabled] = useState(false)
  const [edited, setEdited] = useState(option.value)
  const [inputError, setInputError] = useState({
    inputMaxLength: 0,
    isExceededMaxLength: false,
  })
  const onChangeItem = (e: any) => setEdited(e)

  const saveValue = async () => {
    const key = title.toLowerCase()
    const val = (edited.value || edited).trim()

    if (publicProfileData[key] === val) return
    setDisabled(true)
    const vault = AccountManager.getInstance().vault as any

    await vault.profiles.public.set(key, val)
    setPublicProfileData({ ...publicProfileData, [key]: val })

    navigation.goBack()
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
                placeholder={`Enter the ${option.label}`}
                style={[
                  InputStyles.input,
                  inputError.isExceededMaxLength && styles.inputValidation,
                ]}
                value={edited}
                autoFocus={true}
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
                defaultValue={option.value}
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
                value={edited}
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
            {['textarea', 'input'].includes(option.type) &&
              inputError.isExceededMaxLength && (
                <Text style={styles.inputText}>
                  {option.type} must be less than {inputError.inputMaxLength}{' '}
                  characters
                </Text>
              )}
          </View>
          <Button disabled={disabled} onPress={saveValue}>
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

const mapStateToProps = (rootState: any) => {
  const state = rootState.main
  return { publicProfileData: state.publicProfileData }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditProfile)

const styles = StyleSheet.create({
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
})
