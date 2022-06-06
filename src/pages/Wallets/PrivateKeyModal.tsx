import Clipboard from '@react-native-community/clipboard'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import BottomActionsModal from 'components/BottomActionsModal'
import Button from 'components/Button'

type Props = {
  visible: boolean
  toggleConfirmModal: () => void
  phrase: string
}

export default (props: Props) => {
  const { visible, toggleConfirmModal, phrase } = props
  return (
    <BottomActionsModal
      visible={visible}
      animated={true}
      animationType={'slide'}
      title={'Private Key'}
      // subtitle={'Friendly address name (3hs73j...x7dn)'}
      message={phrase}
      footer={
        <View style={styles.modalFooter}>
          <Button
            color={'grey'}
            style={styles.closeButton}
            onPress={() => toggleConfirmModal()}>
            Close
          </Button>
          <Button
            color={'primary'}
            style={styles.copyButton}
            onPress={() => Clipboard.setString(phrase)}>
            Copy
          </Button>
        </View>
      }
      onClose={() => toggleConfirmModal()}
    />
  )
}

const styles = StyleSheet.create({
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    flex: 1,
    marginRight: 20,
    marginBottom: 0,
  },
  copyButton: {
    flex: 1,
    marginBottom: 0,
  },
})
