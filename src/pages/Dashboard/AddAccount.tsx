import React, { useState } from 'react'
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AuthStackParams } from 'navigation/types'
import Label from 'components/Label'
import InputStyles from 'styles/inputs'
import DropDownPicker from 'components/Select'
import { COUNTRIES } from 'helpers/country-list'
import Button from 'components/Button'
import { Dispatch } from 'redux'
import { setPublicProfileData } from 'reduxStore/general/actions'
import { connect } from 'react-redux'
import Layout from 'components/Layouts/Layout'
import Text from 'components/Text'
import { PRIMARY_COLOR } from 'constants/color'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import AccountManager from 'api/AccountManager'

type Option = {
  label: string
  value: string
}

function AddAccount(
  props: NativeStackScreenProps<AuthStackParams, 'CreateAccount'>
) {
  const { navigation } = props
  const [name, setName] = useState('')
  const [country, setCountry] = useState<Option | null>(null)
  const [processing, setProcessing] = useState(false)

  const onCountryChange = (option: Option) => setCountry(option)
  const onCreateAccount = async () => {
    try {
      setProcessing(true)
      await AccountManager.getInstance().createAccount({
        name,
        country: country?.value || '',
      })
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      props.setPublicProfileData({ name, country: country?.value })
      setProcessing(false)
      navigation.goBack()
    } catch (error) {
      console.error(error)
      setProcessing(false)
      Alert.alert('Error', 'Failed to create account, please try again later')
    }
  }

  return (
    <>
      <NavigationHeader title='Create An Account' />
      <Layout style={styles.container}>
        <View style={styles.content}>
          <Label>Name</Label>
          <TextInput
            placeholder={'e.g John'}
            style={InputStyles.input}
            value={name}
            onChangeText={(t) => setName(t)}
          />

          <Label>Country</Label>
          <DropDownPicker
            searchable={true}
            searchablePlaceholder='Search for country'
            showArrow={true}
            placeholder=''
            items={COUNTRIES}
            containerStyle={InputStyles.select}
            onChangeItem={onCountryChange}
          />
        </View>
        <View style={styles.footer}>
          <Button
            style={styles.createAccountButton}
            color='primary'
            disabled={!country || processing}
            loading={processing}
            onPress={onCreateAccount}>
            Create
          </Button>
        </View>
      </Layout>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    paddingBottom: 30,
  },
  content: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
  },
  createAccountButton: {
    alignSelf: 'stretch',
  },
  importAccountButton: {
    marginTop: 10,
  },
  importAccountButtonText: {
    color: PRIMARY_COLOR,
    fontFamily: NUNITO_SANS_SEMIBOLD,
  },
})

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setPublicProfileData: (data: unknown) =>
      dispatch(setPublicProfileData(data)),
  }
}

export default connect(null, mapDispatchToProps)(AddAccount)
