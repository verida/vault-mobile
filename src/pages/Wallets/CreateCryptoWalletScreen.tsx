import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'

import { BottomActionBar, ScreenWrapper, Typography } from '~/components'
import { createCryptoWallet } from '~/features/cryptoWallet'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps } from '~/navigation'
import { useAppDispatch } from '~/reduxStore/types'
import InputStyles from '~/styles/inputs'
import { Theme } from '~/styles/types'

export type CreateCryptoWalletScreenParams = undefined

type CreateCryptoWalletScreenProps = MainStackScreenProps<'CreateCryptoWallet'>

export const CreateCryptoWalletScreen: React.FC<
  CreateCryptoWalletScreenProps
> = (props) => {
  const { navigation } = props

  useEffect(() => {
    navigation.setOptions({
      title: 'Create Crypto Wallet',
    })
  }, [navigation])

  const [label, setLabel] = useState('')

  const dispatch = useAppDispatch()

  const handleCreateButtonPress = useCallback(() => {
    // TODO: Validate the label

    dispatch(createCryptoWallet({ label }))
    navigation.goBack()
  }, [dispatch, label, navigation])

  const handleCancellButtonPress = useCallback(() => {
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
          placeholder={'eg. Friendly label'}
        />
      </View>
      <BottomActionBar
        actions={[
          {
            label: 'Cancel',
            onPress: handleCancellButtonPress,
            variant: 'secondary',
          },
          {
            label: 'Create',
            onPress: handleCreateButtonPress,
            disabled: !label,
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
