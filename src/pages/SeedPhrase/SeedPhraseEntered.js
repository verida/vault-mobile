import React, { useEffect, useState } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import { Container, Content } from 'native-base'

import Layout from '../../components/Layouts/Layout'
import Button from '../../components/Button'
import Label from '../../components/Label'
import NavigationHeader from 'components/Navigation/NavigationHeader'

import ErrorPhrase from '../../components/ErrorPhrase'

import ModifierStyles from '../../styles/modifier'
import InputStyles from '../../styles/inputs'

import _ from 'underscore'
import CustomFooter from 'components/Layouts/CustomFooter'
import BottomActionsModal from 'components/BottomActionsModal'
import { MNEMONIC_LENGTH } from 'api/AccountManager'

export default (props) => {
  const { route } = props
  const usePrivateKey = route.params?.usePrivateKey || false
  const [phrase, setPhrase] = useState('')
  const [verified, setVerified] = useState(false)
  const [error, showError] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  useEffect(() => {
    const verify = async () => {
      showError(false)
      if (usePrivateKey) {
        // We don't verify private key yet.
        setVerified(true)
        return
      }

      const splitted = phrase && phrase.split(' ')
      if (!splitted) {
        setVerified(false)
        return
      }

      const correct =
        splitted.length === MNEMONIC_LENGTH && _.last(splitted).length
      setVerified(correct)
    }

    verify()
  }, [phrase, usePrivateKey])

  const onContinue = async () => {
    try {
      // await walletByMnemonic(phrase)
      // navigation.navigate('Success')
    } catch (e) {
      showError(true)
    }
  }

  function toggleConfirmModal() {
    setShowConfirmModal((prevState) => !prevState)
  }

  function onConfirm() {
    toggleConfirmModal()
    onContinue()
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
          onPress={usePrivateKey ? toggleConfirmModal : onContinue}
          disabled={!verified}>
          Continue
        </Button>
      </CustomFooter>
      <BottomActionsModal
        visible={showConfirmModal}
        animated={true}
        animationType={'slide'}
        title={
          'That appears to be a valid account, however it isn’t linked to a Verida account (3ID)'
        }
        message={
          'Would you like to create a new Verida account and authorize this blockchain wallet to control your account?'
        }
        footer={
          <View style={styles.modalFooter}>
            <Button
              color={'grey'}
              style={styles.noButton}
              onPress={() => toggleConfirmModal()}>
              No
            </Button>
            <Button
              color={'primary'}
              style={styles.yesButton}
              onPress={onConfirm}>
              Yes
            </Button>
          </View>
        }
        onClose={() => toggleConfirmModal()}
      />
    </Container>
  )
}

const styles = StyleSheet.create({
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noButton: {
    flex: 1,
    marginRight: 20,
    marginBottom: 0,
  },
  yesButton: {
    flex: 1,
    marginBottom: 0,
  },
})
