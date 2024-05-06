import React, { useCallback, useState } from 'react'
import { Modal, StyleSheet, TextInput, View } from 'react-native'

import Button from '~/components/Button'
import Label from '~/components/Label'
import Layout from '~/components/Layouts/Layout'
import { CreateCryptoWalletData } from '~/features/cryptoWallet'
import InputStyles from '~/styles/inputs'

import CloseIcon from 'assets/icons/close_icon.svg'
import NavigationHeader from 'components/Navigation/NavigationHeader'

export type CreateWalletModalProps = {
  visible: boolean
  onCreateNewWallet: (data: CreateCryptoWalletData) => void
  hideModal: () => void
}

export const CreateWalletModal: React.FC<CreateWalletModalProps> = (props) => {
  const { visible, hideModal, onCreateNewWallet } = props

  const [label, setLabel] = useState('')

  const onPressSend = useCallback(() => {
    onCreateNewWallet({ label })
    hideModal()
  }, [onCreateNewWallet, hideModal, label])

  return (
    <Modal
      presentationStyle='pageSheet'
      animationType='slide'
      visible={visible}>
      <NavigationHeader
        left={{
          icon: <CloseIcon />,
          action: () => hideModal(),
        }}
        title='Create wallet'
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
            style={styles.addWalletButton}
            color='primary'
            disabled={!label}
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
