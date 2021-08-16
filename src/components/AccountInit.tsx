import React, { useState } from 'react'
import { connect } from 'react-redux'
import { StyleSheet, TextInput, View, ViewProps } from 'react-native'

import DropDownPicker from './Select'
import Button from './Button'
import Label from './Label'

import InputStyles from '../styles/inputs'
import { COUNTRIES } from 'helpers/country-list'

import { setPublicProfileData } from 'store/general/actions'
import { generateWallet } from '../api'
import { useNavigation } from '@react-navigation/native'
import { Dispatch } from 'redux'
import { AuthStackParams } from 'navigation/types'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

type Option = {
  label: string
  value: string
}

const AccountInit = (props: Omit<ViewProps, 'children'>) => {
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
    navigation.navigate('SeedPhrase')
  }

  return (
    <View style={styles.layout}>
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
          searchablePlaceholder='Search...'
          placeholder=''
          items={COUNTRIES}
          containerStyle={InputStyles.select}
          onChangeItem={onCountryChange}
        />
      </View>
      <Button
        style={styles.mt}
        color='primary'
        disabled={!country || processing}
        loading={processing}
        onPress={onContinue}>
        Continue
      </Button>
    </View>
  )
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setPublicProfileData: (data: unknown) =>
      dispatch(setPublicProfileData(data)),
  }
}

export default connect(null, mapDispatchToProps)(AccountInit)

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: 'red',
  },
  mt: {
    marginTop: 40,
  },
  content: {
    flex: 1,
  },
})
