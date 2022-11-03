import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { utils } from 'ethers'
import { Container, Content } from 'native-base'
import React, { useEffect, useState } from 'react'
import { Alert, TextInput } from 'react-native'

import AccountManager, { MNEMONIC_LENGTH } from 'api/AccountManager'
import CustomFooter from 'components/Layouts/CustomFooter'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { MainStackParams } from 'navigation/types'

import Button from '../../components/Button'
import ErrorPhrase from '../../components/ErrorPhrase'
import Label from '../../components/Label'
import Layout from '../../components/Layouts/Layout'
import InputStyles from '../../styles/inputs'
import ModifierStyles from '../../styles/modifier'

function ImportAccount(
  props: NativeStackScreenProps<MainStackParams, 'ImportAccount'>
) {
  const { navigation } = props
  const usePrivateKey = false
  const [phrase, setPhrase] = useState('')
  const [verified, setVerified] = useState(false)
  const [error, showError] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const verify = async () => {
      showError(false)
      if (usePrivateKey) {
        // We don't verify private key yet.
        setVerified(true)
        return
      }

      const splitted = phrase && phrase.trim().split(' ')
      if (!splitted) {
        setVerified(false)
        return
      }

      const correct = splitted.length === MNEMONIC_LENGTH
      setVerified(correct)
    }

    verify()
  }, [phrase, usePrivateKey])

  const onContinue = async () => {
    try {
      setProcessing(true)
      const isValid = utils.isValidMnemonic(phrase)
      if (!isValid) {
        showError(true)
      }
      const result = await AccountManager.getInstance().importAccount(phrase)
      if (!result) {
        setProcessing(false)
        Alert.alert('Failed', 'Account already exist')
        navigation.goBack()
      }
      setProcessing(false)
      navigation.goBack()
    } catch (e) {
      showError(true)
      setProcessing(false)
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
            editable
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
          disabled={!verified}
          loading={processing}>
          Continue
        </Button>
      </CustomFooter>
    </Container>
  )
}

export default ImportAccount
