import { Icon } from 'native-base'
import React, { useState } from 'react'
import {
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
import DropDownPicker from 'components/Select'
import Text from 'components/Text'
import InputStyles from 'styles/inputs'

import CheckboxCheckedSvg from '../../assets/checkbox_checked.svg'
import CheckboxSvg from '../../assets/checkbox_unchecked.svg'

export default ({ visible, hideModal }) => {
  const [name, setName] = useState('')
  const [phrase, setPhrase] = useState('')
  const [checkbox, setCheckboxState] = useState(false)
  const [blockchain, setBlockchain] = useState(null)
  const onBlockchainChange = (option) => setBlockchain(option)

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
        title='Add address'
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

          <Label>Blockchain</Label>
          <DropDownPicker
            searchable={true}
            searchablePlaceholder='Search for blockchain'
            showArrow={true}
            placeholder=''
            items={[
              { label: 'Ethereum', value: 'Ethereum' },
              { label: 'Near', value: 'Near' },
              { label: 'Algorand', value: 'Algorand' },
            ]}
            containerStyle={InputStyles.select}
            onChangeItem={onBlockchainChange}
          />

          <Label>Enter private key</Label>
          <TextInput
            value={phrase}
            autoFocus={true}
            multiline
            editable
            autoCorrect={false}
            autoCapitalize='none'
            onChangeText={setPhrase}
            style={[InputStyles.textarea]}
            placeholder={'eg. Open despair creek road again ice least'}
          />

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
            style={styles.addWalletButton}
            color='primary'
            disabled={!blockchain}
            // loading={processing}
            // onPress={onAddWallet}
          >
            Add Wallet
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
