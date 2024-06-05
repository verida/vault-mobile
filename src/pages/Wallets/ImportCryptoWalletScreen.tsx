import Clipboard from '@react-native-clipboard/clipboard'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
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
  getWalletTypeLongLabel,
  importCryptoWallet,
  isValidMnemonic,
  isValidPrivateKey,
  WALLET_TYPES,
  WalletType,
} from '~/features/cryptoWallet'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps } from '~/navigation'
import { useAppDispatch } from '~/reduxStore/types'
import InputStyles from '~/styles/inputs'
import { Theme } from '~/styles/types'

// TODO: Move into crypto wallet feature
const walletTypesAllowingPrivateKey: WalletType[] = ['eip155']

// TODO: Move into crypto wallet feature
const defaultWalletType: WalletType = 'multi'

const walletTypeItems = Object.values(WALLET_TYPES).map((type: WalletType) => {
  return {
    label: getWalletTypeLongLabel(type),
    value: type,
  }
})

export type ImportCryptoWalletScreenParams = undefined

type ImportCryptoWalletScreenProps = MainStackScreenProps<'ImportCryptoWallet'>

export const ImportCryptoWalletScreen: React.FC<
  ImportCryptoWalletScreenProps
> = (props) => {
  const { navigation } = props

  useEffect(() => {
    navigation.setOptions({
      title: 'Import Crypto Wallet',
    })
  }, [navigation])

  const [label, setLabel] = useState<string>('')
  const [mnemonic, setMnemonic] = useState<string>('')
  const [privateKey, setPrivateKey] = useState<string>('')
  const [walletType, setWalletType] = useState<WalletType>(defaultWalletType)
  const [importType, setImportType] = useState<'mnemonic' | 'privateKey'>(
    'mnemonic'
  )

  const handleWalletTypeChange = useCallback((option: any) => {
    const value = option.value

    if (value === 'multi') {
      setImportType('mnemonic')
    } else if (walletTypesAllowingPrivateKey.includes(value)) {
      setImportType('privateKey')
    } else {
      setImportType('mnemonic')
    }

    setWalletType(value)
  }, [])

  const handleImportTypeChange = useCallback(
    (option: any) => setImportType(option.value),
    []
  )

  const isImportButtonDisabled = useMemo(() => {
    if (!label) {
      return true
    }
    if (importType === 'mnemonic' && !mnemonic) {
      return true
    }
    if (importType === 'privateKey' && !privateKey) {
      return true
    }
    return false
  }, [label, mnemonic, privateKey, importType])

  const handlePasteButtonPress = useCallback(async () => {
    const clipboardData = await Clipboard.getString()
    if (importType === 'mnemonic') {
      setMnemonic(clipboardData)
    } else {
      setPrivateKey(clipboardData)
    }
  }, [importType])

  const dispatch = useAppDispatch()

  const handleImportButtonPress = useCallback(() => {
    if (importType === 'mnemonic' && !isValidMnemonic(walletType, mnemonic)) {
      Alert.alert('Invalid value', `The seed phrase is not valid`)
      return
    }

    if (
      importType === 'privateKey' &&
      !isValidPrivateKey(walletType, privateKey)
    ) {
      Alert.alert('Invalid value', `The private key is not valid`)
      return
    }

    dispatch(
      importCryptoWallet({
        label,
        walletType,
        mnemonic: importType === 'mnemonic' ? mnemonic : undefined,
        privateKey: importType === 'privateKey' ? privateKey : undefined,
      })
    )

    navigation.goBack()
  }, [
    dispatch,
    navigation,
    label,
    walletType,
    mnemonic,
    privateKey,
    importType,
  ])

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
        {walletTypesAllowingPrivateKey.includes(walletType) ? (
          <View style={styles.importTypeContainer}>
            <Typography variant='label'>Import using</Typography>
            <DropDownPicker
              showArrow={true}
              placeholder=''
              defaultValue='mnemonic' // TODO: Get it according to wallet type
              items={[
                { label: 'Seed Phrase', value: 'mnemonic' },
                { label: 'Private Key', value: 'privateKey' },
              ]}
              containerStyle={InputStyles.select}
              onChangeItem={handleImportTypeChange}
            />
          </View>
        ) : null}
        {importType === 'mnemonic' && (
          <View>
            <Typography variant='label'>Enter seed phrase</Typography>
            <TextInput
              value={mnemonic}
              multiline
              editable
              autoCorrect={false}
              autoCapitalize='none'
              onChangeText={setMnemonic}
              style={[InputStyles.textarea]}
              placeholder={'eg. Open despair creek road ...'}
            />
          </View>
        )}
        {importType === 'privateKey' && (
          <View>
            <Typography variant='label'>Enter private key</Typography>
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
          </View>
        )}
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
            label: 'Import',
            onPress: handleImportButtonPress,
            disabled: isImportButtonDisabled,
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
    importTypeContainer: {
      zIndex: 900,
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
