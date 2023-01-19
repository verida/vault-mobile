import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { utils } from 'ethers'
import isEmpty from 'lodash/isEmpty'
import { Container, Content } from 'native-base'
import React, { useEffect, useState } from 'react'
import { Alert, TextInput } from 'react-native'
import { useDispatch } from 'react-redux'

import AccountManager from 'api/AccountManager'
import CustomFooter from 'components/Layouts/CustomFooter'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { useAuth } from 'hooks/useAuth'
import { MainStackParams } from 'navigation/types'
import { setAuthStatus } from 'reduxStore/general/actions'

import Button from '../../components/Button'
import ErrorPhrase from '../../components/ErrorPhrase'
import Label from '../../components/Label'
import Layout from '../../components/Layouts/Layout'
import CONFIG from '../../config/environment'
import InputStyles from '../../styles/inputs'
import ModifierStyles from '../../styles/modifier'

const cleanSeedPhrase = (phrase: string): string => {
  return phrase.trim().replace(/\s\s+/g, ' ')
}

const verifySeedPhrase = (splitted: string[]): boolean => {
  if (!isEmpty(splitted)) {
    return (
      splitted.length === CONFIG.MNEMONIC_LENGTH &&
      splitted[splitted.length - 1].length > 0
    )
  } else {
    return false
  }
}

const SeedPhraseEntered = (
  props: NativeStackScreenProps<MainStackParams, 'SeedPhraseEntered', 'Success'>
) => {
  const { route, navigation } = props
  const usePrivateKey = route.params?.usePrivateKey || false
  const [phrase, setPhrase] = useState('')
  const [verified, setVerified] = useState(false)
  const [error, showError] = useState(false)
  const [processing, setProcessing] = useState(false)
  const { refresh } = useAuth()
  const dispatch = useDispatch()

  useEffect(() => {
    const verify = () => {
      showError(false)
      if (usePrivateKey) {
        // We don't verify private key yet.
        setVerified(true)
        return
      }

      const cleanedPhrase = cleanSeedPhrase(phrase)
      const splitted = !isEmpty(cleanedPhrase)
        ? cleanedPhrase.trim().split(' ')
        : []

      const isVerified = verifySeedPhrase(splitted)
      setVerified(isVerified)
    }

    verify()
  }, [phrase, usePrivateKey])

  const onContinue = async () => {
    try {
      setProcessing(true)
      const cleanedPhrase = cleanSeedPhrase(phrase)
      const isValid = utils.isValidMnemonic(cleanedPhrase)
      if (!isValid) {
        showError(true)
      }
      const result = await AccountManager.getInstance().importAccount(
        cleanedPhrase
      )
      setProcessing(false)
      if (!result) {
        Alert.alert('Failed', 'Account already exist')
      }

      if (route?.params?.previousScreen === 'Dashboard') {
        navigation.navigate('Dashboard')
      } else {
        dispatch(setAuthStatus(true))
        await refresh()
        navigation.goBack()
      }
    } catch (e) {
      setProcessing(false)
      showError(true)
    }
  }

  const title = usePrivateKey ? 'Seed Phrase or Private Key' : 'Seed Phrase'
  const label = usePrivateKey
    ? 'Enter seed phrase or private key'
    : 'Enter seed phrase'

  return (
    <Container>
      <NavigationHeader title='Import An Account' />
      <Content>
        <Layout title={title}>
          <Label
            style={[ModifierStyles.label, error && ModifierStyles.errorText]}>
            {label}
          </Label>
          <TextInput
            value={phrase}
            autoFocus={true}
            multiline
            editable={!processing}
            autoCorrect={false}
            autoCapitalize='none'
            onChangeText={setPhrase}
            style={[InputStyles.textarea, error && ModifierStyles.error]}
            placeholder={'eg. Open despair creek road again ice least'}
          />
          <ErrorPhrase shown={error} />
        </Layout>
      </Content>
      <CustomFooter>
        <Button
          color='primary'
          onPress={onContinue}
          disabled={!verified || processing}
          loading={processing}>
          Continue
        </Button>
      </CustomFooter>
    </Container>
  )
}

export default SeedPhraseEntered
