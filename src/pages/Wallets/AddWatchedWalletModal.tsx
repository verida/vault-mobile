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
  onAddWatchedWallet: (data: any) => void // TODO: Enforce Wallet type
  hideModal: () => void
}

// TODO: Get this from a maintained centralised list of supported blockchain.
const BLOCKCHAINS = Object.freeze([
  { label: 'Ethereum', value: 'ethereum' },
  { label: 'Near', value: 'near' },
  { label: 'Polygon', value: 'polygon' },
])

export const AddWatchedWalletModal: React.FunctionComponent<Props> = (
  props
) => {
  const { visible, hideModal, onAddWatchedWallet } = props

  const defaultBlockchain = 'ethereum'

  const [label, setLabel] = useState('')
  const [blockchain, setBlockchain] = useState(defaultBlockchain)
  const [publicAddress, setPublicAddress] = useState('')

  const isSubmitButtonDisabled = !label || !publicAddress || !blockchain

  const handleBlockchainChange = useCallback((option: any) => {
    setBlockchain(option.value)
  }, [])

  const handlePressPasteAddressFromClipboard = useCallback(async () => {
    const clipboardData = await Clipboard.getString()
    setPublicAddress(clipboardData)
  }, [])

  const handlePressSubmit = useCallback(() => {
    // TODO: Should we add a check on the address pattern according to the blockchain?
    onAddWatchedWallet({ label, blockchain, publicAddress })
    hideModal()
  }, [blockchain, hideModal, label, onAddWatchedWallet, publicAddress])

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
          <Label>Blockchain</Label>
          <DropDownPicker
            showArrow={true}
            placeholder=''
            defaultValue={defaultBlockchain}
            items={BLOCKCHAINS}
            containerStyle={InputStyles.select}
            onChangeItem={handleBlockchainChange}
            zIndex={6000}
          />
          <Label>Public address</Label>
          <TextInput
            value={publicAddress}
            multiline
            editable
            autoCorrect={false}
            autoCapitalize='none'
            onChangeText={setPublicAddress}
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
