import { useActionSheet } from '@expo/react-native-action-sheet'
import * as SecureStore from 'expo-secure-store'
import { Container, Content, Icon, List } from 'native-base'
import React, { useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'

import { SELECTED_WALLET_STORAGE_KEY } from 'api/AccountManager'
import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import {
  createNewWallet,
  deleteWallet,
  setSelectedWallet,
} from 'reduxStore/wallet/actions'
import {
  getAllWallets,
  getSelectedWallet,
  getWalletCount,
  getWalletProcessingState,
} from 'reduxStore/wallet/selectors'

import OtherSvg from '../../assets/wallets/Other.svg'
import WalletsList from '../../components/WalletsList'
import { SNOW_COLOR } from '../../constants/color'
import AddWalletModal from './AddWalletModal'
import ImportWalletModal from './ImportWalletModal'

const ManageWallets = ({
  wallets,
  walletCount,
  onCreateNewWallet,
  onSetSelectedWallet,
  navigation,
  selectedWalletId,
  loading,
  onImportWallet,
  onDeleteWallet,
}) => {
  const { showActionSheetWithOptions } = useActionSheet()
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)

  const showDeleteAlert = () =>
    Alert.alert('Default wallet', `Error, can't delete the last wallet`)

  const showConfirmationAlert = (item) =>
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
            let selectedWalletID = item.id
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
    const { label, id, accounts } = singleWallet
    return {
      label,
      id,
      icon: <OtherSvg />,
      count: Object.keys(accounts).length,
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
                onPressItem={(item) => {
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
                        let selectedWalletID = item.id
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

const mapStateToProps = (rootState) => {
  const state = rootState.main
  return {
    wallets: getAllWallets(state),
    walletCount: getWalletCount(state),
    selectedWalletId: getSelectedWallet(state),
    loading: getWalletProcessingState(state),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onCreateNewWallet: (args) => dispatch(createNewWallet(args)),
    onSetSelectedWallet: (walletID) => dispatch(setSelectedWallet(walletID)),
    onImportWallet: (args) => dispatch(createNewWallet(args)),
    onDeleteWallet: (walletId) => dispatch(deleteWallet(walletId)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ManageWallets)
