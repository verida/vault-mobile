import { Icon } from 'native-base'
import React, { useState } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import Button from 'components/Button'
import Label from 'components/Label'
import Layout from 'components/Layouts/Layout'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Text from 'components/Text'
import InputStyles from 'styles/inputs'

import CheckboxCheckedSvg from '../../assets/checkbox_checked.svg'
import CheckboxSvg from '../../assets/checkbox_unchecked.svg'

export default ({ visible, hideModal }) => {
  const [name, setName] = useState('')
  const [checkbox, setCheckboxState] = useState(false)

  return (
    <Modal
      presentationStyle='pageSheet'
      animationType='slide'
      visible={visible}>
      <KeyboardAvoidingView behavior={'padding'} style={{ flex: 1 }}>
        <NavigationHeader
          left={{
            icon: <Icon name='close' style={{ color: '#000' }} />,
            action: () => hideModal(),
          }}
          title='Edit address '
        />
        <Layout style={styles.container}>
          <View style={styles.content}>
            <Label>Address name</Label>
            <TextInput
              value={name}
              autoFocus={true}
              multiline
              editable
              autoCorrect={false}
              autoCapitalize='none'
              onChangeText={setName}
              style={[InputStyles.input]}
              placeholder={'eg. Friendly address name'}
            />
            <Text style={styles.inputSublabel}>
              3hs73jhdb76eemn1dm32sdmnx7dn
            </Text>
            <TouchableOpacity
              onPress={() => setCheckboxState(!checkbox)}
              style={styles.checkbox}>
              {checkbox ? <CheckboxCheckedSvg /> : <CheckboxSvg />}
              <Text style={styles.checkboxLabel}>
                Allow this address to unlock my Verida account?
              </Text>
            </TouchableOpacity>
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
              onPress={() => ({})}>
              Save
            </Button>
          </View>
        </Layout>
      </KeyboardAvoidingView>
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
  inputSublabel: { fontSize: 12, color: 'rgba(4, 17, 51, 0.5)', marginTop: 3 },
  checkbox: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  checkboxLabel: {
    marginLeft: 15,
  },
})
