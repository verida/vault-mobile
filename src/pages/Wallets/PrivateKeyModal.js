import React from 'react'
import { View, StyleSheet } from 'react-native'
import Clipboard from '@react-native-community/clipboard'

import Button from 'components/Button'
import BottomActionsModal from 'components/BottomActionsModal'

export default ({ visible, toggleConfirmModal }) => {
  const key = `MIICXAIBAAKBgQCqGKukO1De7zhZj6+H0qtjTkVxwTCpvKe4eCZ0FPqri0cb2JZfXJ/DgYSF6vUpwmJG8wVQZKjeGcjDOL5UlsuusFncCzWBQ7RKNUSesmQRMSGkVb1/3j+skZ6UtW+5u09lHNsj6tQ5`

  return (
    <BottomActionsModal
      visible={visible}
      animated={true}
      animationType={'slide'}
      title={'Private Key'}
      subtitle={'Friendly address name (3hs73j...x7dn)'}
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
