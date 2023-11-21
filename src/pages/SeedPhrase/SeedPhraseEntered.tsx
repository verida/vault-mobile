import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { config } from 'config'
import { utils } from 'ethers'
import isEmpty from 'lodash/isEmpty'
import { Content } from 'native-base'
import React, { useEffect, useState } from 'react'
import { Alert, Keyboard } from 'react-native'

import AccountManager from 'api/AccountManager'
import { FormInput } from 'components/Input/FormInput'
import CustomFooter from 'components/Layouts/CustomFooter'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Screen from 'components/Screen'
import { MainStackParams } from 'navigation/types'

import Button from '../../components/Button'
import Layout from '../../components/Layouts/Layout'
import ModifierStyles from '../../styles/modifier'

const cleanSeedPhrase = (phrase: string): string => {
  return phrase.trim().replace(/\s\s+/g, ' ')
}

const verifySeedPhrase = (splitted: string[]): boolean => {
  if (!isEmpty(splitted)) {
    return (
      splitted.length === config.MNEMONIC_LENGTH &&
      splitted[splitted.length - 1].length > 0
    )
  } else {
    return false
  }
}

const SeedPhraseEntered = (
  props: NativeStackScreenProps<MainStackParams, 'SeedPhraseEntered'>
) => {
  const { route, navigation } = props
  const usePrivateKey = route.params?.usePrivateKey || false
  const [phrase, setPhrase] = useState('')
  const [verified, setVerified] = useState(false)
  const [error, showError] = useState(false)
  const [processing, setProcessing] = useState(false)

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
      Keyboard.dismiss()
      setProcessing(true)
      const cleanedPhrase = cleanSeedPhrase(phrase)
      const isValid = utils.isValidMnemonic(cleanedPhrase)
      if (!isValid) {
        throw new Error('Invalid seed phrase')
      }
      const result = await AccountManager.getInstance().importAccount(
        cleanedPhrase
      )
      if (!result) {
        Alert.alert('Failed', 'Account already exist')
      }

      if (route?.params?.previousScreen === 'Dashboard') {
        navigation.navigate('Dashboard')
      } else {
        navigation.navigate('Success')
      }
    } catch (cause) {
      showError(true)
    } finally {
      setProcessing(false)
    }
  }

  const title = usePrivateKey ? 'Seed Phrase or Private Key' : 'Seed Phrase'
  const label = usePrivateKey
    ? 'Enter seed phrase or private key'
    : 'Enter seed phrase'

  return (
    <Screen
      withKeyboardAvoidingView
      navBar={<NavigationHeader title='Import An Account' />}>
      <Content>
        <Layout title={title}>
          <FormInput
            value={phrase}
            autoFocus
            multiline
            editable={!processing}
            autoCorrect={false}
            label={label}
            autoCapitalize='none'
            errorMessage={
              !error
                ? undefined
                : 'That does not appear to be a valid seed phrase that was exported from the Verida Vault, please try again'
            }
            onChangeText={setPhrase}
            style={[error && ModifierStyles.error]}
            inputStyle={{ minHeight: 68 }}
            placeholder={'eg. Open despair creek road again ice least'}
          />
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
    </Screen>
  )
}

export default SeedPhraseEntered
