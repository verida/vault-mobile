import { useActionSheet } from '@expo/react-native-action-sheet'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as SecureStore from 'expo-secure-store'
import { Container, Content, Icon, List } from 'native-base'
import React, { useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import { SELECTED_WALLET_STORAGE_KEY } from 'api/AccountManager'
import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { MainStackParams } from 'navigation/types'
import {
  createNewWallet,
  deleteWallet,
  importWallet,
  setSelectedWallet,
} from 'reduxStore/wallet/actions'
import {
  getAllWallets,
  getSelectedWalletId,
  getWalletCount,
  getWalletProcessingState,
} from 'reduxStore/wallet/selectors'
import { selectChains } from 'reduxStore/tokens/selectors'

import OtherSvg from '../../assets/wallets/Other.svg'
import WalletsList from '../../components/WalletsList'
import { SNOW_COLOR } from '../../constants/color'
import AddWalletModal from './AddWalletModal'
import ImportWalletModal from './ImportWalletModal'

export type SingleAccountType = {
  mnemonic: string
  privateKey: string
  publicKey: string
  address: string
}

export type AccountsType = {
  [key: string]: SingleAccountType
}

export type WalletType = {
  id: string
  type: string
  seedPhrase: string
  label: string
  accounts: [AccountsType]
  chain?: string
}

export type walletIdType = string

type Props = {
  wallets: [WalletType]
  walletCount: number
  onCreateNewWallet: () => Promise<void>
  onSetSelectedWallet: (selectedWalletID: string) => Promise<void>
  navigation: NativeStackNavigationProp<MainStackParams, any>
  selectedWalletId: number
  loading: boolean
  onImportWallet: () => Promise<void>
  onDeleteWallet: (selectedWalletID: string) => Promise<void>
  chains: any
}

const ManageWallets = (props: Props) => {
  const {
    wallets,
    walletCount,
    onCreateNewWallet,
    onSetSelectedWallet,
    navigation,
    selectedWalletId,
    loading,
    onImportWallet,
    onDeleteWallet,
    chains,
  } = props
  const { showActionSheetWithOptions } = useActionSheet()
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)

  const showDeleteAlert = () =>
    Alert.alert('Default wallet', `Error, can't delete the last wallet`)

  const showConfirmationAlert = (item: WalletType) =>
    Alert.alert(
      'Are you sure?',
      `This is irreversible, please backup your seed phrase before deleting the wallet.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const selectedWalletID = item.id
            onDeleteWallet(selectedWalletID)
          },
        },
      ]
    )

  const onPressImportWallet = () => {
    setImportModalVisible(true)
  }

  const onPressAddWallet = () => {
    setAddModalVisible(true)
  }

  const list = Object.values(wallets).map((singleWallet) => {
    const { label, id, type } = singleWallet
    return {
      label,
      id,
      icon: <OtherSvg />,
      count: type === 'multi' ? Object.keys(chains).length : 1,
    }
  })

  return (
    <Container>
      <NavigationHeader
        title='Wallets'
        right={{
          icon: <Icon name='add' style={{ color: '#000' }} />,
          action: () =>
            showActionSheetWithOptions(
              {
                options: ['Create new wallet', 'Import a wallet', 'Cancel'],
                cancelButtonIndex: 2,
              },
              (buttonIndex) => {
                if (buttonIndex === 0) {
                  onPressAddWallet()
                }
                if (buttonIndex === 1) {
                  onPressImportWallet()
                }
              }
            ),
        }}
      />
      {loading ? (
        <LoadingView />
      ) : (
        <View style={{ flex: 1 }}>
          <Content style={styles.content}>
            <List>
              <WalletsList
                onPressItem={(item: WalletType) => {
                  showActionSheetWithOptions(
                    {
                      options: [
                        'View seed phrases',
                        'Switch to this wallet',
                        'Delete Wallet',
                        'Cancel',
                      ],
                      cancelButtonIndex: 3,
                      destructiveButtonIndex: 2,
                    },
                    (buttonIndex) => {
                      if (buttonIndex === 0) {
                        navigation.navigate('SingleWallet', { item })
                      }
                      if (buttonIndex === 1) {
                        const selectedWalletID = item.id
                        onSetSelectedWallet(selectedWalletID)
                        SecureStore.setItemAsync(
                          SELECTED_WALLET_STORAGE_KEY,
                          selectedWalletID
                        )
                      }
                      if (buttonIndex === 2) {
                        if (walletCount <= 1) {
                          showDeleteAlert()
                        } else {
                          showConfirmationAlert(item)
                        }
                      }
                    }
                  )
                }}
                list={list}
                selectedWalletId={selectedWalletId}
              />
            </List>
          </Content>
          <ImportWalletModal
            hideModal={() => setImportModalVisible(false)}
            visible={importModalVisible}
            onImportWallet={onImportWallet}
          />
          <AddWalletModal
            hideModal={() => setAddModalVisible(false)}
            visible={addModalVisible}
            onCreateNewWallet={onCreateNewWallet}
          />
        </View>
      )}
    </Container>
  )
}

const styles = StyleSheet.create({
  content: { backgroundColor: SNOW_COLOR, paddingVertical: 25 },
})

const mapStateToProps = (rootState: any) => {
  const state = rootState.main
  return {
    wallets: getAllWallets(state),
    walletCount: getWalletCount(state),
    selectedWalletId: getSelectedWalletId(state),
    loading: getWalletProcessingState(state),
    chains: selectChains(rootState),
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onCreateNewWallet: (args: unknown) =>
      dispatch(createNewWallet(args) as any),
    onSetSelectedWallet: (walletID: string) =>
      dispatch(setSelectedWallet(walletID) as any),
    onImportWallet: (args: any) => dispatch(importWallet(args) as any),
    onDeleteWallet: (walletId: string) =>
      dispatch(deleteWallet(walletId) as any),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ManageWallets as any)
