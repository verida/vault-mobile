import { useActionSheet } from '@expo/react-native-action-sheet'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Container, Content, List } from 'native-base'
import React, { useCallback, useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'

import PlusIcon from '~/assets/plus_icon.svg'
import UnionIcon from '~/assets/union_icon.svg'
import { CryptoWalletList } from '~/components/CryptoWallet'
import LoadingView from '~/components/LoadingView'
import NavigationHeader from '~/components/Navigation/NavigationHeader'
import { BLACK_COLOR } from '~/constants/color'
import {
  addWatchedCryptoWallet,
  AddWatchedCryptoWalletData,
  createCryptoWallet,
  CreateCryptoWalletData,
  deleteCryptoWallet,
  importCryptoWallet,
  ImportCryptoWalletData,
  LegacyCryptoWallet,
  selectCryptoWallet,
  useCryptoWallets,
  useCryptoWalletsCount,
  useCryptoWalletsStatus,
  useSelectedCryptoWalletId,
} from '~/features/cryptoWallet'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackParams } from '~/navigation/types'
import { useAppDispatch } from '~/reduxStore/types'
import { Theme } from '~/styles/types'

import { AddWatchedWalletModal } from './AddWatchedWalletModal'
import { CreateWalletModal } from './CreateWalletModal'
import { ImportWalletModal } from './ImportWalletModal'

type Props = {
  navigation: NativeStackNavigationProp<MainStackParams, any>
}

const ManageWallets = (props: Props) => {
  const { navigation } = props

  const cryptoWallets = useCryptoWallets()
  const cryptoWalletCount = useCryptoWalletsCount()
  const selectedCryptoWalletId = useSelectedCryptoWalletId()
  const { processsing } = useCryptoWalletsStatus()

  const dispatch = useAppDispatch()

  const handleSelectWallet = useCallback(
    (walletId: string) => {
      dispatch(selectCryptoWallet(walletId))
    },
    [dispatch]
  )

  const handleCreateWallet = useCallback(
    (data: CreateCryptoWalletData) => {
      dispatch(createCryptoWallet(data))
    },
    [dispatch]
  )

  const handleImportWallet = useCallback(
    (data: ImportCryptoWalletData) => {
      dispatch(importCryptoWallet(data))
    },
    [dispatch]
  )

  const handleAddWatchedWallet = useCallback(
    (data: AddWatchedCryptoWalletData) => {
      dispatch(addWatchedCryptoWallet(data))
    },
    [dispatch]
  )

  const handleDeleteWallet = useCallback(
    (walletId: string) => {
      dispatch(deleteCryptoWallet(walletId))
    },
    [dispatch]
  )

  const [createWalletModalVisible, setCreateWalletModalVisible] =
    useState(false)
  const [importWalletModalVisible, setImportWalletModalVisible] =
    useState(false)
  const [addWatchedWalletModalVisible, setAddWatchedWalletModalVisible] =
    useState(false)

  const { showActionSheetWithOptions } = useActionSheet()

  const showDeleteAlert = () => {
    Alert.alert('Default wallet', `Error, can't delete the last wallet`)
  }

  const showConfirmationAlert = (item: LegacyCryptoWallet) =>
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
            handleDeleteWallet(item.id)
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

  const handlePressWalletListItem = (item: LegacyCryptoWallet) => {
    let options
    if (item.readOnly) {
      options = ['Select this wallet', 'Delete Wallet', 'Cancel']
    } else {
      options = [
        'View seed phrases',
        'Select this wallet',
        'Delete Wallet',
        'Cancel',
      ]
    }

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
        destructiveButtonIndex: options.length - 2,
        tintColor: BLACK_COLOR,
      },
      (buttonIndex) => {
        if (typeof buttonIndex !== 'number') {
          return
        }

        if (item.readOnly) {
          buttonIndex++
        }

        if (buttonIndex === 0 && !item.readOnly) {
          navigation.navigate('SingleWallet', { walletId: item.id })
        } else if (buttonIndex === 1) {
          handleSelectWallet(item.id)
        } else if (buttonIndex === 2) {
          if (cryptoWalletCount <= 1) {
            showDeleteAlert()
          } else {
            showConfirmationAlert(item)
          }
        }
      }
    )
  }

  const styles = useThemeAwareStyle(createStyles)

  return (
    <Container>
      <NavigationHeader
        title='Manage Wallets'
        right={{
          icon: <PlusIcon />,
          action: navigationActionHandler,
        }}
      />
      {processsing ? (
        <LoadingView />
      ) : (
        <View style={{ flex: 1 }}>
          <Content style={styles.content}>
            <List>
              <CryptoWalletList
                list={cryptoWallets}
                selectedWalletId={selectedCryptoWalletId}
                onPressItem={handlePressWalletListItem}
                showMoreIcon
              />
            </List>
          </Content>
          <CreateWalletModal
            hideModal={() => setCreateWalletModalVisible(false)}
            visible={createWalletModalVisible}
            onCreateNewWallet={handleCreateWallet}
          />
          <ImportWalletModal
            hideModal={() => setImportWalletModalVisible(false)}
            visible={importWalletModalVisible}
            onImportWallet={handleImportWallet}
          />
          <AddWatchedWalletModal
            hideModal={() => setAddWatchedWalletModalVisible(false)}
            visible={addWatchedWalletModalVisible}
            onAddWatchedWallet={handleAddWatchedWallet}
          />
        </View>
      )}
    </Container>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    content: {
      backgroundColor: theme.color.snow,
      paddingVertical: 25,
    },
  })

export default ManageWallets
