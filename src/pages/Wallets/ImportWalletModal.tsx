import Clipboard from '@react-native-clipboard/clipboard'
import React, { useState } from 'react'
import {
  Alert,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import Button from '~/components/Button'
import Label from '~/components/Label'
import Layout from '~/components/Layouts/Layout'
import DropDownPicker from '~/components/Select'
import Text from '~/components/Text'
import { NUNITO_SANS_BOLD } from '~/constants/text'
import {
  getWalletTypeLongLabel,
  ImportCryptoWalletData,
  isValidMnemonic,
  isValidPrivateKey,
  WALLET_TYPES,
  WalletType,
} from '~/features/cryptoWallet'
import InputStyles from '~/styles/inputs'

import ClipboardIcon from 'assets/clipboard_icon.svg'
import CloseIcon from 'assets/icons/close_icon.svg'
import NavigationHeader from 'components/Navigation/NavigationHeader'

export type ImportWalletModalProps = {
  visible: boolean
  onImportWallet: (data: ImportCryptoWalletData) => void
  hideModal: () => void
}

const walletTypesAllowingPrivateKey: WalletType[] = ['eip155'] // TODO: Move into blockchain or crypto wallet feature

const defaultWalletType: WalletType = 'multi'

export const ImportWalletModal: React.FC<ImportWalletModalProps> = (props) => {
  const { visible, hideModal, onImportWallet } = props

  const [label, setLabel] = useState('')
  const [mnemonic, setMnemonic] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [walletType, setWalletType] = useState<WalletType>(defaultWalletType)

  const [inputSwitch, setInputSwitch] = useState<'mnemonic' | 'privateKey'>(
    'mnemonic'
  )

  const walletTypeItems = Object.values(WALLET_TYPES).map(
    (type: WalletType) => {
      return {
        label: getWalletTypeLongLabel(type),
        value: type,
      }
    }
  )

  const onBlockchainChange = (option: any) => {
    const value = option.value

    if (value === 'multi') {
      setInputSwitch('mnemonic')
    } else if (walletTypesAllowingPrivateKey.includes(value)) {
      setInputSwitch('privateKey')
    } else {
      setInputSwitch('mnemonic')
    }

    setWalletType(value)
  }

  const onSwitchChange = (option: any) => setInputSwitch(option.value)

  const isDisabled = () => {
    if (!label) return true
    if (inputSwitch === 'mnemonic' && !mnemonic) return true
    if (inputSwitch === 'privateKey' && !privateKey) return true
    return false
  }
  const disabled = isDisabled()

  const fetchCopiedText = async () => {
    const clipboardData = await Clipboard.getString()
    if (inputSwitch === 'mnemonic') {
      setMnemonic(clipboardData)
    } else {
      setPrivateKey(clipboardData)
    }
  }

  const onPressSend = () => {
    const isValid =
      inputSwitch === 'mnemonic'
        ? isValidMnemonic(walletType, mnemonic)
        : isValidPrivateKey(walletType, privateKey)

    if (!isValid) {
      Alert.alert(
        'Invalid value',
        inputSwitch === 'mnemonic'
          ? `The seed phrase is not valid`
          : `The private key is not valid`
      )
    }

    onImportWallet({
      label,
      walletType,
      mnemonic: inputSwitch === 'mnemonic' ? mnemonic : undefined,
      privateKey: inputSwitch === 'privateKey' ? privateKey : undefined,
    })
    hideModal()
  }

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
        title='Import wallet'
      />
      <Layout style={styles.container}>
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

          <Label>Wallet type</Label>
          <DropDownPicker
            showArrow={true}
            defaultValue={defaultWalletType}
            items={walletTypeItems}
            containerStyle={InputStyles.select}
            onChangeItem={onBlockchainChange}
            zIndex={6000}
          />

          {walletTypesAllowingPrivateKey.includes(walletType) ? (
            <>
              <Label>Import using</Label>
              <DropDownPicker
                showArrow={true}
                placeholder=''
                defaultValue='mnemonic' // TODO: Get it according to wallet type
                items={[
                  { label: 'Seed Phrase', value: 'mnemonic' },
                  { label: 'Private Key', value: 'privateKey' },
                ]}
                containerStyle={InputStyles.select}
                onChangeItem={onSwitchChange}
              />
            </>
          ) : null}

          {inputSwitch === 'mnemonic' && (
            <>
              <Label>Enter seed phrase</Label>
              <TextInput
                value={mnemonic}
                multiline
                editable
                autoCorrect={false}
                autoCapitalize='none'
                onChangeText={setMnemonic}
                style={[InputStyles.textarea]}
                placeholder={'eg. Open despair creek road ...'}
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
            <ClipboardIcon />
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
