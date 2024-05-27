import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'

import { BottomActionBar, ScreenWrapper, Typography } from '~/components'
import { updateCryptoWallet, useCryptoWallets } from '~/features/cryptoWallet'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps } from '~/navigation'
import { useAppDispatch } from '~/reduxStore/types'
import InputStyles from '~/styles/inputs'
import { Theme } from '~/styles/types'

export type EditCryptoWalletScreenParams = {
  walletId: string
}

type EditCryptoWalletScreenProps = MainStackScreenProps<'EditCryptoWallet'>

export const EditCryptoWalletScreen: React.FC<EditCryptoWalletScreenProps> = (
  props
) => {
  const {
    navigation,
    route: { params },
  } = props
  const { walletId } = params

  useEffect(() => {
    navigation.setOptions({
      title: 'Import Crypto Wallet',
    })
  }, [navigation])

  const [label, setLabel] = useState('')

  const cryptoWallets = useCryptoWallets()

  useEffect(() => {
    const cryptoWallet = cryptoWallets.find((wallet) => wallet.id === walletId)
    if (cryptoWallet) {
      setLabel(cryptoWallet.label)
    }

    // TODO: Handle wallet not found, unlikely but still
  }, [cryptoWallets, walletId])

  const isSaveButtonDisabled = useMemo(() => {
    return !label
  }, [label])

  const dispatch = useAppDispatch()

  const handleSaveButtonPress = useCallback(() => {
    dispatch(
      updateCryptoWallet({
        walletId,
        data: { label },
      })
    )
    navigation.goBack()
  }, [dispatch, walletId, label, navigation])

  const handleCancelButtonPress = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const styles = useThemeAwareStyle(createStyles)

  return (
    <ScreenWrapper isModal keyboardAvoiding>
      <View style={styles.container}>
        <Typography variant='label'>Wallet label</Typography>
        <TextInput
          value={label}
          autoFocus={true}
          editable
          autoCorrect={false}
          autoCapitalize='none'
          onChangeText={setLabel}
          style={[InputStyles.input]}
          placeholder={'eg. Friendly wallet label'}
        />
      </View>
      <BottomActionBar
        actions={[
          {
            label: 'Cancel',
            onPress: handleCancelButtonPress,
            variant: 'secondary',
          },
          {
            label: 'Save',
            onPress: handleSaveButtonPress,
            disabled: isSaveButtonDisabled,
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
      padding: theme.spacing.m,
    },
  })
