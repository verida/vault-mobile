import Clipboard from '@react-native-community/clipboard'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import BottomActionsModal from 'components/BottomActionsModal'
import Button from 'components/Button'

export default ({ visible, toggleConfirmModal }) => {
  const key =
    'Open despair creek road again ice least peach ball open transformer'

  return (
    <BottomActionsModal
      visible={visible}
      animated={true}
      animationType={'slide'}
      title={'Seed Phrase'}
      message={key}
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
            onPress={() => Clipboard.setString(key)}>
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
