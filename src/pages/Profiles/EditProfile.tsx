import React, { useState } from 'react'
import { TextInput, View } from 'react-native'
import { Container, Content } from 'native-base'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'

import Label from '../../components/Label'
import Button from '../../components/Button'

import InputStyles from '../../styles/inputs'
import { COUNTRIES } from '../../helpers/country-list'
import DropDownPicker from '../../components/Select'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { setPublicProfileData } from '../../reduxStore/general/actions'

// import IntlPhoneInput from 'react-native-intl-phone-input'
import AccountManager from 'api/AccountManager'

const EditProfile = (props: any) => {
  const { navigation, route, publicProfileData, setPublicProfileData } = props
  const { title, option } = route.params

  const [disabled, setDisabled] = useState(false)
  const [edited, setEdited] = useState(option.value)
  const onChangeItem = (e: any) => setEdited(e)

  const saveValue = async () => {
    const key = title.toLowerCase()
    const val = (edited.value || edited).trim()

    if (publicProfileData[key] === val) return
    setDisabled(true)
    const vault = AccountManager.getInstance().vault as any

    await vault.profiles.public.set(key, val)
    setPublicProfileData({ publicProfileData, [key]: val })
    navigation.goBack()
  }

  return (
    <Container>
      <NavigationHeader title={title} />
      <Content
        contentContainerStyle={{
          flex: 1,
          margin: 20,
          justifyContent: 'space-between',
        }}>
        <View>
          <Label>{option.label}</Label>
          {option.type === 'input' && (
            <TextInput
              placeholder={`Enter the ${option.label}`}
              style={InputStyles.input}
              value={edited}
              autoFocus={true}
              onChangeText={setEdited}
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
              style={InputStyles.textarea}
              value={edited}
              multiline
              numberOfLines={4}
              maxLength={255}
              editable
              autoFocus={true}
              onChangeText={setEdited}
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
        <Button disabled={disabled} onPress={saveValue}>
          Save Changes
        </Button>
      </Content>
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
  return { publicProfileData: state.publicProfileData }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditProfile)
