import { useActionSheet } from '@expo/react-native-action-sheet'
import React, { useCallback, useEffect } from 'react'
import { Alert, StyleSheet, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Icon, ScreenWrapper } from '~/components'
import { CryptoWalletList } from '~/components/CryptoWallet'
import { HIT_SLOP_10_10 } from '~/constants'
import { useTheme } from '~/contexts'
import {
  deleteCryptoWallet,
  LegacyCryptoWallet,
  selectCryptoWallet,
  useCryptoWalletsCount,
} from '~/features/cryptoWallet'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps } from '~/navigation/types'
import { useAppDispatch } from '~/reduxStore/types'
import { Theme } from '~/styles/types'

export type ManageWalletsScreenParams = undefined

type ManageWalletsScreenProps = MainStackScreenProps<'ManageWallets'>

export const ManageWalletsScreen: React.FC<ManageWalletsScreenProps> = (
  props
) => {
  const { navigation } = props

  const cryptoWalletCount = useCryptoWalletsCount()

  const dispatch = useAppDispatch()

  const handleSelectWallet = useCallback(
    (walletId: string) => {
      dispatch(selectCryptoWallet(walletId))
    },
    [dispatch]
  )

  const handleDeleteWallet = useCallback(
    (walletId: string) => {
      dispatch(deleteCryptoWallet(walletId))
    },
    [dispatch]
  )

  const { theme } = useTheme()
  const styles = useThemeAwareStyle(createStyles)

  const { showActionSheetWithOptions } = useActionSheet()

  const showDeleteAlert = useCallback(() => {
    Alert.alert('Default wallet', `Error, can't delete the last wallet`)
  }, [])

  const showConfirmationAlert = useCallback(
    (item: LegacyCryptoWallet) =>
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
      ),
    [handleDeleteWallet]
  )

  const handlePressCreateWallet = useCallback(() => {
    navigation.navigate('CreateCryptoWallet')
  }, [navigation])

  const handlePressImportWallet = useCallback(() => {
    navigation.navigate('ImportCryptoWallet')
  }, [navigation])

  const handlePressAddWatchedWallet = useCallback(() => {
    navigation.navigate('AddWatchedCryptoWallet')
  }, [navigation])

  const handleAddWalletPress = useCallback(() => {
    showActionSheetWithOptions(
      {
        options: [
          'Create new wallet',
          'Import a wallet',
          'Add watched wallet',
          'Cancel',
        ],
        icons: [
          <Icon
            name='add'
            size={24}
            color={theme.color.primary}
            key={'Create new wallet'}
          />,
          <Icon
            name='import'
            size={24}
            color={theme.color.primary}
            key={'Import a wallet'}
          />,
          <Icon
            name='eye'
            size={24}
            color={theme.color.primary}
            key={'Add watched wallet'}
          />,
        ],
        tintIcons: false,
        cancelButtonIndex: 3,
        tintColor: theme.color.black,
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
  }, [
    showActionSheetWithOptions,
    handlePressCreateWallet,
    handlePressImportWallet,
    handlePressAddWatchedWallet,
    theme.color.primary,
    theme.color.black,
  ])

  const handlePressWalletListItem = useCallback(
    (item: LegacyCryptoWallet) => {
      let options
      if (item.readOnly) {
        options = ['Select this wallet', 'Delete Wallet', 'Cancel']
      } else {
        options = [
          'View details',
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
          tintColor: theme.color.black,
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
    },
    [
      cryptoWalletCount,
      handleSelectWallet,
      navigation,
      showActionSheetWithOptions,
      showConfirmationAlert,
      showDeleteAlert,
      theme.color.black,
    ]
  )

  useEffect(() => {
    navigation.setOptions({
      title: 'Manage Wallets',
      headerShadowVisible: false,
      headerRight: () => (
        <TouchableOpacity
          onPress={handleAddWalletPress}
          hitSlop={HIT_SLOP_10_10}
          style={styles.headerAddWalletButton}>
          <Icon name='add' size={24} color={theme.color.primary} />
        </TouchableOpacity>
      ),
    })
  }, [
    navigation,
    handleAddWalletPress,
    styles.headerAddWalletButton,
    theme.color.primary,
  ])

  const { bottom } = useSafeAreaInsets()

  return (
    <ScreenWrapper safeAreaEdges={['left', 'right']}>
      <CryptoWalletList
        onPressItem={handlePressWalletListItem}
        showMoreIcon
        contentContainerStyle={{
          paddingBottom: bottom,
        }}
      />
    </ScreenWrapper>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    headerAddWalletButton: {
      marginRight: theme.spacing.m,
    },
  })
