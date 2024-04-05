import Clipboard from '@react-native-community/clipboard'
import { Icon } from 'native-base'
import React, { useCallback, useState } from 'react'
import {
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import Button from '~/components/Button'
import Label from '~/components/Label'
import Layout from '~/components/Layouts/Layout'
import NavigationHeader from '~/components/Navigation/NavigationHeader'
import DropDownPicker from '~/components/Select'
import Text from '~/components/Text'
import { NUNITO_SANS_BOLD } from '~/constants/text'
import {
  AddWatchedCryptoWalletData,
  WALLET_TYPES,
  WalletType,
} from '~/features/cryptoWallet'
import InputStyles from '~/styles/inputs'

export type AddWatchedWalletModalProps = {
  visible: boolean
  onAddWatchedWallet: (data: AddWatchedCryptoWalletData) => void
  hideModal: () => void
}

const defaultWalletType: WalletType = 'multi'

export const AddWatchedWalletModal: React.FunctionComponent<
  AddWatchedWalletModalProps
> = (props) => {
  const { visible, hideModal, onAddWatchedWallet } = props

  const [label, setLabel] = useState('')
  const [walletType, setWalletType] = useState<WalletType>(defaultWalletType)
  const [address, setAddress] = useState('')

  const walletTypeItems = Object.values(WALLET_TYPES).map(
    (type: WalletType) => {
      return {
        label: type, // TODO: Get proper label of the blockchain namespace
        value: type,
      }
    }
  )

  const isSubmitButtonDisabled = !label || !address || !walletType

  const handleWalletTypeChange = useCallback((option: any) => {
    setWalletType(option.value)
  }, [])

  const handlePressPasteAddressFromClipboard = useCallback(async () => {
    const clipboardData = await Clipboard.getString()
    setAddress(clipboardData)
  }, [])

  const handlePressSubmit = useCallback(() => {
    // TODO: Add a check on the address pattern according to the blockchain?
    onAddWatchedWallet({
      label,
      walletType,
      address,
    })
    hideModal()
  }, [walletType, hideModal, label, onAddWatchedWallet, address])

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
        title='Add watched wallet'
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
            onChangeItem={handleWalletTypeChange}
            zIndex={6000}
          />
          <Label>Public address</Label>
          <TextInput
            value={address}
            multiline
            editable
            autoCorrect={false}
            autoCapitalize='none'
            onChangeText={setAddress}
            style={[InputStyles.textarea]}
            placeholder={'eg. 0x...'}
          />
          <TouchableOpacity
            onPress={handlePressPasteAddressFromClipboard}
            style={styles.actionButton}>
            <Icon name='clipboard' style={styles.actionButtonIcon} />
            <Text style={styles.actionButtonText}>Paste</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <Button
            style={styles.addWalletButton}
            color='primary'
            disabled={isSubmitButtonDisabled}
            onPress={handlePressSubmit}>
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
