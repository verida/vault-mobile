import { Icon } from 'native-base'
import React, { useState } from 'react'
import { Modal, StyleSheet, TextInput, View } from 'react-native'

import Button from '~/components/Button'
import Label from '~/components/Label'
import Layout from '~/components/Layouts/Layout'
import NavigationHeader from '~/components/Navigation/NavigationHeader'
import { UpdateCryptoWalletData } from '~/features/cryptoWallet'
import InputStyles from '~/styles/inputs'

type Props = {
  visible: boolean
  onPressRename: (id: string, data: UpdateCryptoWalletData) => void
  hideModal: () => void
  data: { id: string; label: string }
}

export default (props: Props) => {
  const { visible, hideModal, data, onPressRename } = props

  const [label, setLabel] = useState(data.label)

  const onPressSave = () => {
    onPressRename(data.id, { label })
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
        title='Rename wallet'
      />
      <Layout withKeyboardAvoidingView style={styles.container}>
        <View style={styles.content}>
          <Label>Wallet label</Label>
          <TextInput
            value={label}
            autoFocus={true}
            multiline
            editable
            autoCorrect={false}
            autoCapitalize='none'
            onChangeText={setLabel}
            style={[InputStyles.input]}
            placeholder={'eg. Friendly wallet label'}
          />
        </View>
        <View style={styles.footer}>
          <Button
            style={styles.cancelButton}
            color='transparent-border'
            onPress={() => hideModal()}>
            Cancel
          </Button>
          <Button
            style={styles.saveButton}
            color='primary'
            disabled={!label}
            onPress={onPressSave}>
            Save
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
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(4, 17, 51, 0.2)',
  },
  content: {
    flex: 1,
  },
  footer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  cancelButton: {
    flex: 1,
    marginRight: 20,
  },
  saveButton: {
    flex: 1,
  },
})
