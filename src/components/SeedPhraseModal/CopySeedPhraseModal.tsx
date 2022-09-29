import React from 'react'
import { StyleSheet, View } from 'react-native'

import BottomActionsModal from 'components/BottomActionsModal'
import Button from 'components/Button'

type Props = {
  visible: boolean
  toggleConfirmModal: () => void
  phrase: string
  onPress: (phrase: string) => void
}

export default (props: Props) => {
  const { visible, toggleConfirmModal, phrase, onPress } = props
  return (
    <BottomActionsModal
      visible={visible}
      animated={true}
      animationType={'slide'}
      title={'Seed Phrase'}
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
            onPress={onPress}
          >
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
