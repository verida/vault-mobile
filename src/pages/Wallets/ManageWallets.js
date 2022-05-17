import { useActionSheet } from '@expo/react-native-action-sheet'
import * as SecureStore from 'expo-secure-store'
import { Container, Content, Icon, List } from 'native-base'
import React from 'react'
import { StyleSheet } from 'react-native'
import { connect } from 'react-redux'

import { SELECTED_WALLET_STORAGE_KEY } from 'api/AccountManager'
import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { createNewWallet, setSelectedWallet } from 'reduxStore/wallet/actions'
import {
  getAllWallets,
  getSelectedWallet,
  getWalletProcessingState,
} from 'reduxStore/wallet/selectors'

import OtherSvg from '../../assets/wallets/Other.svg'
import WalletsList from '../../components/WalletsList'
import { SNOW_COLOR } from '../../constants/color'

const ManageWallets = ({
  wallets,
  onCreateNewWallet,
  onSetSelectedWallet,
  navigation,
  selectedWalletId,
  loading,
}) => {
  const { showActionSheetWithOptions } = useActionSheet()

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
                options: ['Create new wallet', 'Cancel'],
                cancelButtonIndex: 1,
              },
              (buttonIndex) => {
                if (buttonIndex === 0) {
                  onCreateNewWallet()
                }
              }
            ),
        }}
      />
      {loading ? (
        <LoadingView />
      ) : (
        <Content style={styles.content}>
          <List>
            <WalletsList
              onPressItem={(item) => {
                showActionSheetWithOptions(
                  {
                    options: [
                      'Manage Wallet',
                      'Switch to this wallet',
                      'Cancel',
                    ],
                    cancelButtonIndex: 2,
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
                  }
                )
              }}
              list={list}
              selectedWalletId={selectedWalletId}
            />
          </List>
        </Content>
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
    selectedWalletId: getSelectedWallet(state),
    loading: getWalletProcessingState(state),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onCreateNewWallet: () => dispatch(createNewWallet()),
    onSetSelectedWallet: (walletID) => dispatch(setSelectedWallet(walletID)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ManageWallets)
