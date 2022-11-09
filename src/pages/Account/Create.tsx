import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { COUNTRIES } from 'helpers/country-list'
import { get, isEmpty } from 'lodash'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { connect, useSelector } from 'react-redux'
import { Dispatch } from 'redux'

import AccountManager from 'api/AccountManager'
import Button from 'components/Button'
import Label from 'components/Label'
import Layout from 'components/Layouts/Layout'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import DropDownPicker, { Option } from 'components/Select'
import TCCheckbox from 'components/TCCheckbox'
import Text from 'components/Text'
import { PRIMARY_COLOR } from 'constants/color'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { useDataRegion } from 'hooks/useDataRegion'
import { AuthStackParams } from 'navigation/types'
import { setPublicProfileData } from 'reduxStore/general/actions'
import InputStyles from 'styles/inputs'

export enum CreateAccountMode {
  CREATE,
  ADD,
}

function Create(
  props: NativeStackScreenProps<AuthStackParams, 'CreateAccount'>
) {
  const { navigation, route } = props
  const [name, setName] = useState('')
  const [country, setCountry] = useState<Option | null>(null)
  const [processing, setProcessing] = useState(false)
  const [agreedTC, setAgreedTC] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)
  useDataRegion()
  const networks = useSelector((state: any) => state.main.networks)
  const countries = useSelector((state: any) => state.main.countries)

  useEffect(() => {
    const isNameValid = name.length >= 2 && name.length <= 140
    const isCountryValid =
      !!country && country.value.length >= 2 && country.value.length <= 140
    setIsFormValid(isNameValid && isCountryValid && agreedTC)
  }, [country, name.length, agreedTC])

  const onCountryChange = (option: Option) => {
    setCountry(option)
  }
  const onCreateAccount = async () => {
    if (!country) {
      return
    }

    if (isEmpty(networks) || isEmpty(countries)) {
      // If no node config is available, prevent user from creating account
      Alert.alert(
        'Failed',
        'Verida is currently unavailable. Please try again shortly.'
      )
      return
    }

    setProcessing(true)
    setTimeout(async () => {
      try {
        await AccountManager.getInstance().createAccount(
          {
            name,
            country: country?.value || '',
            description: '',
          },
          country?.value
        )
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        props.setPublicProfileData({
          name,
          country: country?.value,
          description: '',
        })
        setProcessing(false)

        if (
          get(route.params, 'mode', CreateAccountMode.CREATE) ===
          CreateAccountMode.CREATE
        ) {
          navigation.navigate('CreatePin')
        } else {
          navigation.goBack()
        }
      } catch (error) {
        setProcessing(false)
        Alert.alert('Error', 'Failed to create account, please try again later')
      }
    }, 0)
  }

  const onImportAccount = () => {
    navigation.navigate('SeedPhraseEntered', {})
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
            editable={!processing}
            onChangeText={(t) => setName(t)}
          />

          <Label>Country</Label>
          <DropDownPicker
            searchable
            disabled={processing}
            searchablePlaceholder='Search for country'
            showArrow
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
