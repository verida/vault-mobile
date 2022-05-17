import { Icon } from 'native-base'
import React, { useState } from 'react'
import { Alert, Modal, StyleSheet, TextInput, View } from 'react-native'
import { isValidSeedPhrase } from 'wallet/helpers/validation'

import Button from 'components/Button'
import Label from 'components/Label'
import Layout from 'components/Layouts/Layout'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import InputStyles from 'styles/inputs'

export default ({ visible, hideModal, onCreateNewWallet }) => {
  const [name, setName] = useState('')

  const onPressSend = () => {
    onCreateNewWallet({ name })
    hideModal()
  }

  return (
    <Modal
      presentationStyle='pageSheet'
      animationType='slide'
      visible={visible}>
      <NavigationHeader
        left={{
          icon: <Icon name='close' style={{ color: '#000' }} />,
          action: () => hideModal(),
        }}
        title='Create wallet'
      />
      <Layout style={styles.container}>
        <View style={styles.content}>
          <Label>Wallet name</Label>
          <TextInput
            value={name}
            autoFocus={true}
            multiline
            editable
            autoCorrect={false}
            autoCapitalize='none'
            onChangeText={setName}
            style={[InputStyles.input]}
            placeholder={'eg. Friendly wallet name'}
          />
        </View>
        <View style={styles.footer}>
          <Button
            style={styles.addWalletButton}
            color='primary'
            disabled={!name}
            onPress={onPressSend}>
            Create Wallet
          </Button>
        </View>
      </Layout>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(4, 17, 51, 0.2)',
  },
  content: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
  },
  addWalletButton: {
    alignSelf: 'stretch',
  },
})
