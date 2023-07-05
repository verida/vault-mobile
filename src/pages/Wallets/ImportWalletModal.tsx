import Clipboard from '@react-native-community/clipboard'
import { getBlockchainNetworks } from 'features/wallets'
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
import { connect } from 'react-redux'
import { isValidSeedPhrase } from 'wallet/helpers/validation'

import { BlockchainNetwork } from 'api/types'
import Button from 'components/Button'
import Label from 'components/Label'
import Layout from 'components/Layouts/Layout'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import DropDownPicker from 'components/Select'
import Text from 'components/Text'
import { NUNITO_SANS_BOLD } from 'constants/text'
import { getBlockchainNetworkLabel } from 'reduxStore/selectors'
import InputStyles from 'styles/inputs'

type Props = {
  visible: boolean
  blockchainNetworks: Record<string, BlockchainNetwork> | undefined
  onImportWallet: (data: any) => void
  hideModal: () => void
}

const defaultBlockchainNetworks: Record<string, BlockchainNetwork> =
  Object.freeze({})

const ImportModal = ({
  visible,
  hideModal,
  onImportWallet,
  blockchainNetworks: maybeBlockchainNetworks,
}: Props) => {
  const blockchainNetworks =
    maybeBlockchainNetworks || defaultBlockchainNetworks

  const privateKeyEnabledNetworks = ['eip155']
  const [name, setName] = useState('')
  const [phrase, setPhrase] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [blockchain, setBlockchain] = useState('multi')
  const [inputSwitch, setInputSwitch] = useState('seedPhrase')

  const onBlockchainChange = (option: any) => {
    const network = blockchainNetworks[option.value]

    if (option.value === 'multi') {
      setInputSwitch('seedPhrase')
    } else if (privateKeyEnabledNetworks.includes(network.namespace)) {
      setInputSwitch('privateKey')
    } else {
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

  const blockchainItems = Object.values(blockchainNetworks).map(
    (network: BlockchainNetwork) => {
      return {
        label: getBlockchainNetworkLabel(network),
        value: network.chainId,
      }
    }
  )

  blockchainItems.unshift({ label: 'Multichain Wallet', value: 'multi' })

  const showAlert = () =>
    Alert.alert('Invalid seed phrase', `That's not a valid seed phrase`)

  const onPressSend = () => {
    const blockchainNetwork =
      blockchain === 'multi' ? undefined : blockchainNetworks[blockchain]
    if (
      isValidSeedPhrase({ phrase, privateKey, blockchainNetwork, inputSwitch })
    ) {
      onImportWallet({
        phrase,
        name,
        walletType: blockchain,
        blockchainNetwork,
        privateKey,
        inputSwitch,
      })
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
          icon: <Icon name='close' style={{ color: '#000' }} />,
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
            items={blockchainItems}
            containerStyle={InputStyles.select}
            onChangeItem={onBlockchainChange}
            zIndex={6000}
          />

          {privateKeyEnabledNetworks.includes(blockchain.split(':')[0]) ? (
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

const mapStateToProps = (rootState: any) => {
  return {
    blockchainNetworks: getBlockchainNetworks(rootState),
  }
}

export default connect(mapStateToProps)(ImportModal)
