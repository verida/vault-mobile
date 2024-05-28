import Clipboard from '@react-native-clipboard/clipboard'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import { BottomActionBar, Icon, ScreenWrapper, Typography } from '~/components'
import DropDownPicker from '~/components/Select'
import { useTheme } from '~/contexts'
import {
  addWatchedCryptoWallet,
  getWalletTypeLongLabel,
  WALLET_TYPES,
  WalletType,
} from '~/features/cryptoWallet'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps } from '~/navigation'
import { useAppDispatch } from '~/reduxStore/types'
import InputStyles from '~/styles/inputs'
import { Theme } from '~/styles/types'

const defaultWalletType: WalletType = 'multi'

const walletTypeItems = Object.values(WALLET_TYPES).map((type: WalletType) => {
  return {
    label: getWalletTypeLongLabel(type),
    value: type,
  }
})

export type AddWatchedCryptoWalletScreenParams = undefined

type AddWatchedCryptoWalletScreenProps =
  MainStackScreenProps<'AddWatchedCryptoWallet'>

export const AddWatchedCryptoWalletScreen: React.FunctionComponent<
  AddWatchedCryptoWalletScreenProps
> = (props) => {
  const { navigation } = props

  useEffect(() => {
    navigation.setOptions({
      title: 'Add Watched Crypto Wallet',
    })
  }, [navigation])

  const [label, setLabel] = useState('')
  const [walletType, setWalletType] = useState<WalletType>(defaultWalletType)
  const [address, setAddress] = useState('')

  const isAddButtonDisabled = useMemo(() => {
    return !label || !address || !walletType
  }, [label, address, walletType])

  const dispatch = useAppDispatch()

  const handleWalletTypeChange = useCallback((option: any) => {
    setWalletType(option.value)
  }, [])

  const handlePasteButtonPress = useCallback(async () => {
    const clipboardData = await Clipboard.getString()
    setAddress(clipboardData)
  }, [])

  const handleAddButtonPress = useCallback(() => {
    // TODO: Add a check on the address pattern according to the blockchain?

    dispatch(
      addWatchedCryptoWallet({
        label,
        walletType,
        address,
      })
    )
    navigation.goBack()
  }, [dispatch, label, navigation, walletType, address])

  const handleCancelButtonPress = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()

  return (
    <ScreenWrapper isModal keyboardAvoiding>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        alwaysBounceVertical={false}>
        <View>
          <Typography variant='label'>Wallet label</Typography>
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
        </View>
        <View style={styles.walletTypeContainer}>
          <Typography variant='label'>Wallet type</Typography>
          <DropDownPicker
            showArrow={true}
            defaultValue={defaultWalletType}
            items={walletTypeItems}
            containerStyle={InputStyles.select}
            onChangeItem={handleWalletTypeChange}
          />
        </View>
        <View>
          <Typography variant='label'>Public address</Typography>
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
        </View>
        <TouchableOpacity
          onPress={handlePasteButtonPress}
          style={styles.pasteButton}>
          <Icon name='paste' size={24} color={theme.color.primary} />
          <Typography variant='button' style={styles.pasteButtonLabel}>
            Paste
          </Typography>
        </TouchableOpacity>
      </ScrollView>
      <BottomActionBar
        actions={[
          {
            label: 'Cancel',
            onPress: handleCancelButtonPress,
            variant: 'secondary',
          },
          {
            label: 'Add',
            onPress: handleAddButtonPress,
            disabled: isAddButtonDisabled,
          },
        ]}
      />
    </ScreenWrapper>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing.m,
      gap: theme.spacing.m,
    },
    walletTypeContainer: {
      zIndex: 1000,
    },
    pasteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    pasteButtonLabel: {
      color: theme.color.primary,
    },
  })
