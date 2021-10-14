import React, { useEffect, useState } from 'react'
import { Modal, View, StyleSheet, TextInput } from 'react-native'
import { Container, Content, List, Icon } from 'native-base'
import { useActionSheet } from '@expo/react-native-action-sheet'

import WalletsList from '../../components/WalletsList'
import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Layout from 'components/Layouts/Layout'
import Label from 'components/Label'
import InputStyles from 'styles/inputs'
import DropDownPicker from 'components/Select'
import Button from 'components/Button'

import { SNOW_COLOR } from '../../constants/color'

import EthereumSvg from '../../assets/wallets/Ethereum.svg'
import AlgorandSvg from '../../assets/wallets/Algorand.svg'
import IKIGAISvg from '../../assets/wallets/IKIGAI.svg'
import NearSvg from '../../assets/wallets/Near.svg'
import OtherSvg from '../../assets/wallets/Other.svg'

const list = [
  {
    label: 'Ethereum',
    icon: <EthereumSvg />,
    count: 12,
    onPress: () => {
      console.log()
    },
  },
  {
    label: 'Near',
    icon: <NearSvg />,
    count: 10,
    onPress: () => {
      console.log()
    },
  },
  {
    label: 'Algorand',
    icon: <AlgorandSvg />,
    count: 9,
    onPress: () => {
      console.log()
    },
  },
  {
    label: 'Friendly wallet name',
    icon: <IKIGAISvg />,
    count: 5,
    onPress: () => {
      console.log()
    },
  },
  {
    label: 'Other addresses',
    icon: <OtherSvg />,
    count: 20,
    onPress: () => {
      console.log()
    },
    other: true,
  },
]

export default ({ navigation }) => {
  useEffect(() => {
    const init = async () => {
      console.log('init')
    }

    init()
  }, [])
  const [loading, setLoading] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [name, setName] = useState('')
  const [phrase, setPhrase] = useState('')
  const [blockchain, setBlockchain] = useState(null)
  const [processing, setProcessing] = useState(false)
  const { showActionSheetWithOptions } = useActionSheet()

  const onBlockchainChange = (option) => setBlockchain(option)
  const onAddWallet = async () => {
    try {
      setProcessing(true)
      setTimeout(() => {
        setAddModalVisible(false)
        setProcessing(false)
        navigation.navigate('SuccessFailure', {
          failure: name === '' ? true : false,
        })
      }, 2000)
    } catch (error) {
      setProcessing(false)
    }
  }

  return (
    <Container>
      <NavigationHeader
        title='Wallets'
        right={{
          icon: <Icon name='add' style={{ color: '#000' }} />,
          action: () =>
            showActionSheetWithOptions(
              {
                options: [
                  'Create new wallet',
                  'Import existing',
                  'Watch existing address',
                  'Cancel',
                ],
                cancelButtonIndex: 3,
              },
              (buttonIndex) => {
                if (buttonIndex === 0) {
                  setAddModalVisible(true)
                }
                if (buttonIndex === 1) {
                  setImportModalVisible(true)
                }
                if (buttonIndex === 2) {
                  navigation.navigate('SingleWallet')
                }
              }
            ),
        }}
      />
      {loading ? (
        <LoadingView />
      ) : (
        <Content style={{ backgroundColor: SNOW_COLOR, paddingVertical: 25 }}>
          <List>
            <WalletsList list={list} />
          </List>
        </Content>
      )}
      <Modal
        presentationStyle='pageSheet'
        animationType='slide'
        visible={addModalVisible}>
        <NavigationHeader
          left={{
            icon: <Icon name='close' style={{ color: '#000' }} />,
            action: () => setAddModalVisible(false),
          }}
          title='Add wallet'
        />
        <Layout style={styles.container}>
          <View style={styles.content}>
            <Label>Wallet name</Label>
            <TextInput
              placeholder={'e.g Personal'}
              style={InputStyles.input}
              value={name}
              onChangeText={(t) => setName(t)}
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
          </View>
          <View style={styles.footer}>
            <Button
              style={styles.addWalletButton}
              color='primary'
              disabled={!blockchain || processing}
              loading={processing}
              onPress={onAddWallet}>
              Add Wallet
            </Button>
          </View>
        </Layout>
      </Modal>
      <Modal
        presentationStyle='pageSheet'
        animationType='slide'
        visible={importModalVisible}>
        <NavigationHeader
          left={{
            icon: <Icon name='close' style={{ color: '#000' }} />,
            action: () => setImportModalVisible(false),
          }}
          title='Import wallet'
        />
        <Layout style={styles.container}>
          <View style={styles.content}>
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

            <Label>Enter seed phrase</Label>
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
          </View>
          <View style={styles.footer}>
            <Button
              style={styles.addWalletButton}
              color='primary'
              disabled={!blockchain || processing}
              loading={processing}
              onPress={onAddWallet}>
              Add Wallet
            </Button>
          </View>
        </Layout>
      </Modal>
    </Container>
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
})
