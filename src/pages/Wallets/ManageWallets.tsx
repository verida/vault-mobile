import { useActionSheet } from '@expo/react-native-action-sheet'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as SecureStore from 'helpers/VeridaSecureStore'
import { Container, Content, List } from 'native-base'
import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import WalletList from 'components/WalletList'
import { WalletItem } from 'components/WalletList/types'
import CONFIG from 'config/environment'
import { MainStackParams } from 'navigation/types'
import { selectChains } from 'reduxStore/tokens/selectors'
import {
  addWatchedWallet,
  createNewWallet,
  deleteWallet,
  importWallet,
  setSelectedWallet,
} from 'reduxStore/wallet/actions'
import {
  getSelectedWalletId,
  getWalletCount,
  getWalletList,
  getWalletProcessingState,
} from 'reduxStore/wallet/selectors'

import PlusIcon from '../../assets/plus_icon.svg'
import UnionIcon from '../../assets/union_icon.svg'
import { BLACK_COLOR, SNOW_COLOR } from '../../constants/color'
import CreateWalletModal from './AddWalletModal'
import { AddWatchedWalletModal } from './AddWatchedWalletModal'
import ImportWalletModal from './ImportWalletModal'

export type walletIdType = string

type Props = {
  wallets: WalletItem[]
  walletCount: number
  navigation: NativeStackNavigationProp<MainStackParams, any>
  selectedWalletId: number | string
  loading: boolean
  chains: any
  onSetSelectedWalletId: (selectedWalletID: string) => Promise<void>
  onCreateWallet: () => Promise<void>
  onImportWallet: () => Promise<void>
  onAddWatchedWallet: () => Promise<void>
  onDeleteWallet: (selectedWalletID: string) => Promise<void>
}

const ManageWallets = (props: Props) => {
  const {
    wallets,
    walletCount,
    navigation,
    selectedWalletId,
    loading,
    chains,
    onSetSelectedWalletId,
    onCreateWallet,
    onImportWallet,
    onAddWatchedWallet,
    onDeleteWallet,
  } = props

  const [createWalletModalVisible, setCreateWalletModalVisible] =
    useState(false)
  const [importWalletModalVisible, setImportWalletModalVisible] =
    useState(false)
  const [addWatchedWalletModalVisible, setAddWatchedWalletModalVisible] =
    useState(false)
  const [walletList, setWalletList] = useState<WalletItem[]>([])

  const { showActionSheetWithOptions } = useActionSheet()

  useEffect(() => {
    if (wallets) {
      setWalletList(wallets)
    }
  }, [chains, wallets])

  const showDeleteAlert = () => {
    Alert.alert('Default wallet', `Error, can't delete the last wallet`)
  }

  const showConfirmationAlert = (item: WalletItem) =>
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

  const handlePressImportWallet = () => {
    setImportWalletModalVisible(true)
  }

  const handlePressCreateWallet = () => {
    setCreateWalletModalVisible(true)
  }

  const handlePressAddWatchedWallet = () => {
    setAddWatchedWalletModalVisible(true)
  }

  const navigationActionHandler = () => {
    showActionSheetWithOptions(
      {
        options: [
          'Create new wallet',
          'Import a wallet',
          'Add watched wallet', // TODO: Define appropriate label
          'Cancel',
        ],
        icons: [
          <PlusIcon key={'Create new wallet'} />,
          <UnionIcon key={'Import a wallet'} />,
          <PlusIcon key={'Add watched wallet'} />, // TODO: Define appropriate icon
        ],
        tintIcons: false,
        cancelButtonIndex: 3,
        tintColor: BLACK_COLOR,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            handlePressCreateWallet()
            break
          case 1:
            handlePressImportWallet()
            break
          case 2:
            handlePressAddWatchedWallet()
            break
          default:
            break
        }
      }
    )
  }

  const handlePressWalletListItem = (item: WalletItem) => {
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
        tintColor: BLACK_COLOR,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          navigation.navigate('SingleWallet', { item })
        }
        if (buttonIndex === 1) {
          const selectedWalletID = item.id
          onSetSelectedWalletId(selectedWalletID)
          SecureStore.setItemAsync(
            CONFIG.SELECTED_WALLET_STORAGE_KEY,
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
  }

  return (
    <Container>
      <NavigationHeader
        title='Manage Wallets'
        right={{
          icon: <PlusIcon />,
          action: navigationActionHandler,
        }}
      />
      {loading ? (
        <LoadingView />
      ) : (
        <View style={{ flex: 1 }}>
          <Content style={styles.content}>
            <List>
              <WalletList
                list={walletList}
                selectedWalletId={selectedWalletId}
                onPressItem={handlePressWalletListItem}
              />
            </List>
          </Content>
          <CreateWalletModal
            hideModal={() => setCreateWalletModalVisible(false)}
            visible={createWalletModalVisible}
            onCreateNewWallet={onCreateWallet}
          />
          <ImportWalletModal
            hideModal={() => setImportWalletModalVisible(false)}
            visible={importWalletModalVisible}
            onImportWallet={onImportWallet}
          />
          <AddWatchedWalletModal
            hideModal={() => setAddWatchedWalletModalVisible(false)}
            visible={addWatchedWalletModalVisible}
            onAddWatchedWallet={onAddWatchedWallet}
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
  const chains = selectChains(rootState)
  return {
    chains,
    wallets: getWalletList(state),
    walletCount: getWalletCount(state),
    selectedWalletId: getSelectedWalletId(state),
    loading: getWalletProcessingState(state),
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onSetSelectedWalletId: (walletID: string) =>
      dispatch(setSelectedWallet(walletID) as any),
    onCreateWallet: (args: unknown) => dispatch(createNewWallet(args) as any),
    onImportWallet: (args: any) => dispatch(importWallet(args) as any),
    onAddWatchedWallet: (args: any) => dispatch(addWatchedWallet(args) as any),
    onDeleteWallet: (walletId: string) =>
      dispatch(deleteWallet(walletId) as any),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ManageWallets as any)
