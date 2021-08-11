import React, { useState } from 'react'
import { connect } from 'react-redux'
import { StyleSheet, TextInput, ViewProps } from 'react-native'

import DropDownPicker from './Select'
import Button from './Button'
import Layout from './Layouts/Layout'
import Label from './Label'

import InputStyles from '../styles/inputs'
import { COUNTRIES } from '../helpers/country-list'

import { setPublicProfileData } from '../store/general/actions'
import { generateWallet } from '../api'
import { useNavigation } from '@react-navigation/native'
import { Dispatch } from 'redux'
import { AuthStackParams } from 'navigation/types'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

// eslint-disable-next-line no-shadow
export enum AccountInitMode {
  SELECT_NETWORK,
  SEED_PHRASE,
}

type Props = Omit<ViewProps, 'children'> & {
  mode: AccountInitMode
}

type Option = {
  label: string
  value: string
}

const AccountInit = (props: Props) => {
  const [name, setName] = useState('')
  const [country, setCountry] = useState<Option | null>(null)
  const [processing, setProcessing] = useState(false)
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>()

  const onCountryChange = (option: Option) => setCountry(option)
  const onContinue = async () => {
    setProcessing(true)
    await generateWallet({ name, country: country?.value })
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    props.setPublicProfileData({ name, country: country?.value })
    if (props.mode === AccountInitMode.SEED_PHRASE) {
      navigation.navigate('SeedPhrase')
    } else {
      navigation.navigate('SelectNetwork')
    }
  }

  return (
    <Layout title='Select Username' style={style.layout}>
      <Label>Name</Label>
      <TextInput
        placeholder={'Enter your name'}
        style={InputStyles.input}
        value={name}
        onChangeText={(t) => setName(t)}
      />

      <Label>Country</Label>
      <DropDownPicker
        searchable={true}
        searchablePlaceholder='Search...'
        placeholder=''
        items={COUNTRIES}
        containerStyle={InputStyles.select}
        onChangeItem={onCountryChange}
      />
      <Button
        style={style.mt}
        color='primary'
        disabled={!country || processing}
        onPress={onContinue}>
        Continue
      </Button>
    </Layout>
  )
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setPublicProfileData: (data: unknown) =>
      dispatch(setPublicProfileData(data)),
  }
}

export default connect(null, mapDispatchToProps)(AccountInit)

const style = StyleSheet.create({
  layout: {
    minHeight: '70%',
  },
  mt: {
    marginTop: 40,
  },
})
