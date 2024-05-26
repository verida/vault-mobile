import React, { useCallback, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'

import { BottomActionBar, ScreenWrapper } from '~/components'
import { CryptoWalletList } from '~/components/CryptoWallet'
import { LegacyCryptoWallet, selectCryptoWallet } from '~/features/cryptoWallet'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps } from '~/navigation'
import { useAppDispatch } from '~/reduxStore/types'

export type SwitchSelectedCryptoWalletScreenParams = undefined

type SwitchSelectedCryptoWalletScreenProps =
  MainStackScreenProps<'SwitchSelectedCryptoWallet'>

export const SwitchSelectedCryptoWalletScreen: React.FC<
  SwitchSelectedCryptoWalletScreenProps
> = (props) => {
  const { navigation } = props

  useEffect(() => {
    navigation.setOptions({
      title: 'Select a Crypto Wallet',
    })
  }, [navigation])

  const dispatch = useAppDispatch()

  const handleWalletSelection = useCallback(
    (item: LegacyCryptoWallet) => {
      dispatch(selectCryptoWallet(item.id))
      navigation.goBack()
    },
    [navigation, dispatch]
  )

  const handleManageWalletsPress = useCallback(() => {
    navigation.replace('ManageWallets')
  }, [navigation])

  const styles = useThemeAwareStyle(createStyles)

  return (
    <ScreenWrapper isModal>
      <View style={styles.container}>
        <CryptoWalletList onPressItem={handleWalletSelection} />
      </View>
      <BottomActionBar
        actions={[
          {
            label: 'Manage Wallets',
            onPress: handleManageWalletsPress,
          },
        ]}
      />
    </ScreenWrapper>
  )
}

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
  })
