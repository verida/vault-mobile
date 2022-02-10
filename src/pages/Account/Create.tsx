import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { COUNTRIES } from 'helpers/country-list'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import AccountManager from 'api/AccountManager'
import Button from 'components/Button'
import Label from 'components/Label'
import Layout from 'components/Layouts/Layout'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import DropDownPicker from 'components/Select'
import TCCheckbox from 'components/TCCheckbox'
import Text from 'components/Text'
import { PRIMARY_COLOR } from 'constants/color'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { AuthStackParams } from 'navigation/types'
import { setPublicProfileData } from 'reduxStore/general/actions'
import InputStyles from 'styles/inputs'

type Option = {
  label: string
  value: string
}

function Create(
  props: NativeStackScreenProps<AuthStackParams, 'CreateAccount'>
) {
  const { navigation } = props
  const [name, setName] = useState('')
  const [country, setCountry] = useState<Option | null>(null)
  const [processing, setProcessing] = useState(false)
  const [agreedTC, setAgreedTC] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)

  useEffect(() => {
    const isNameValid = name.length >= 2 && name.length <= 140
    const isCountryValid =
      !!country && country.value.length >= 2 && country.value.length <= 140
    setIsFormValid(isNameValid && isCountryValid)
  }, [country, name.length])

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
      navigation.navigate('CreatePin')
    } catch (error) {
      console.error(error)
      setProcessing(false)
      Alert.alert('Error', 'Failed to create account, please try again later')
    }
  }

  const onImportAccount = () => {
    navigation.navigate('SeedPhraseEntered')
  }

  function toggleAgreedTC() {
    setAgreedTC((prevState) => !prevState)
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
          <TCCheckbox
            checked={agreedTC}
            style={styles.termAndCondition}
            onToggle={toggleAgreedTC}
          />
        </View>
        <View style={styles.footer}>
          <Button
            style={styles.createAccountButton}
            color='primary'
            disabled={!isFormValid || processing}
            loading={processing}
            onPress={onCreateAccount}>
            Create Account
          </Button>
          <Text>Already have an account?</Text>
          <TouchableOpacity
            style={styles.importAccountButton}
            hitSlop={{ top: 10, bottom: 10, right: 0, left: 0 }}
            onPress={onImportAccount}>
            <Text style={styles.importAccountButtonText}>
              Click here to import
            </Text>
          </TouchableOpacity>
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
  termAndCondition: {
    marginTop: 15,
  },
})

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setPublicProfileData: (data: unknown) =>
      dispatch(setPublicProfileData(data)),
  }
}

export default connect(null, mapDispatchToProps)(Create)
