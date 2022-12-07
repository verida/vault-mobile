import Clipboard from '@react-native-community/clipboard'
import { Icon } from 'native-base'
import React, { useState } from 'react'
import {
  Alert,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { isValidSeedPhrase } from 'wallet/helpers/validation'

import LeftArrowIcon from 'assets/icons/left_arrow_icon.svg'
import Button from 'components/Button'
import Label from 'components/Label'
import Layout from 'components/Layouts/Layout'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import DropDownPicker from 'components/Select'
import Text from 'components/Text'
import { NUNITO_SANS_BOLD } from 'constants/text'
import InputStyles from 'styles/inputs'

type Props = {
  visible: boolean
  onImportWallet: (data: any) => void
  hideModal: () => void
}

const ImportWalletModal = ({ visible, hideModal, onImportWallet }: Props) => {
  const privateKeyEnabledChains = ['ethereum', 'polygon']
  const [name, setName] = useState('')
  const [phrase, setPhrase] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [blockchain, setBlockchain] = useState('multi')
  const [inputSwitch, setInputSwitch] = useState('seedPhrase')
  const onBlockchainChange = (option: any) => {
    if (!privateKeyEnabledChains.includes(option.value)) {
      setInputSwitch('seedPhrase')
    }
    setBlockchain(option.value)
  }
  const onSwitchChange = (option: any) => setInputSwitch(option.value)
  const isDisabled = () => {
    if (!name) return true
    if (inputSwitch === 'seedPhrase' && !phrase) return true
    if (inputSwitch === 'privateKey' && !privateKey) return true
    return false
  }
  const disabled = isDisabled()

  const fetchCopiedText = async () => {
    const clipboardData = await Clipboard.getString()
    if (inputSwitch === 'seedPhrase') {
      setPhrase(clipboardData)
    } else {
      setPrivateKey(clipboardData)
    }
  }

  const showAlert = () =>
    Alert.alert('Invalid seed phrase', `That's not a valid seed phrase`)

  const onPressSend = () => {
    if (isValidSeedPhrase({ phrase, privateKey, blockchain, inputSwitch })) {
      onImportWallet({ phrase, name, blockchain, privateKey, inputSwitch })
      hideModal()
    } else {
      showAlert()
    }
  }

  return (
    <Modal
      presentationStyle='pageSheet'
      animationType='slide'
      visible={visible}>
      <NavigationHeader
        left={{
          icon: <LeftArrowIcon />,
          action: () => hideModal(),
        }}
        title='Import wallet'
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

          <Label>Blockchain</Label>
          <DropDownPicker
            showArrow={true}
            placeholder=''
            defaultValue='multi'
            items={[
              { label: 'Multichain Wallet', value: 'multi' },
              { label: 'Ethereum', value: 'ethereum' },
              { label: 'Near', value: 'near' },
              { label: 'Algorand', value: 'algorand' },
              { label: 'Polygon', value: 'polygon' },
            ]}
            containerStyle={InputStyles.select}
            onChangeItem={onBlockchainChange}
            zIndex={6000}
          />

          {privateKeyEnabledChains.includes(blockchain) ? (
            <>
              <Label>Import using</Label>
              <DropDownPicker
                showArrow={true}
                placeholder=''
                defaultValue='seedPhrase'
                items={[
                  { label: 'Seed Phrase', value: 'seedPhrase' },
                  { label: 'Private Key', value: 'privateKey' },
                ]}
                containerStyle={InputStyles.select}
                onChangeItem={onSwitchChange}
              />
            </>
          ) : (
            <></>
          )}

          {inputSwitch === 'seedPhrase' && (
            <>
              <Label>Enter seed phrase</Label>
              <TextInput
                value={phrase}
                multiline
                editable
                autoCorrect={false}
                autoCapitalize='none'
                onChangeText={setPhrase}
                style={[InputStyles.textarea]}
                placeholder={'eg. Open despair creek road again ice least'}
              />
            </>
          )}

          {inputSwitch === 'privateKey' && (
            <>
              <Label>Enter private key</Label>
              <TextInput
                value={privateKey}
                multiline
                editable
                autoCorrect={false}
                autoCapitalize='none'
                onChangeText={setPrivateKey}
                style={[InputStyles.textarea]}
                placeholder={'eg. 0x...'}
              />
            </>
          )}

          <TouchableOpacity
            onPress={fetchCopiedText}
            style={styles.actionButton}>
            <Icon name='clipboard' style={styles.actionButtonIcon} />
            <Text style={styles.actionButtonText}>Paste</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <Button
            style={styles.addWalletButton}
            color='primary'
            disabled={disabled}
            onPress={onPressSend}>
            Import Wallet
          </Button>
        </View>
      </Layout>
    </Modal>
  )
}
export default ImportWalletModal

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
  actionButton: {
    marginRight: 25,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  actionButtonIcon: {
    color: 'rgba(66, 59, 206, 1)',
    fontSize: 24,
    marginRight: 10,
  },
  actionButtonText: {
    color: 'rgba(66, 59, 206, 1)',
    fontFamily: NUNITO_SANS_BOLD,
  },
})
