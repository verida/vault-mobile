import React, { useState } from 'react'
import { View, Modal, TextInput, StyleSheet } from 'react-native'
import { Icon } from 'native-base'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import Layout from 'components/Layouts/Layout'
import Label from 'components/Label'
import Button from 'components/Button'
import InputStyles from 'styles/inputs'

export default ({ visible, hideModal }) => {
  const [name, setName] = useState('')

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
            style={styles.cancelButton}
            color='transparent-border'
            onPress={() => hideModal()}>
            Cancel
          </Button>
          <Button
            style={styles.saveButton}
            color='primary'
            disabled={!name}
            onPress={() => console.log()}>
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
