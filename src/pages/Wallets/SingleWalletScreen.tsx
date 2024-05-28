import React, { useCallback, useEffect } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import ExportSeedphraseSvg from '~/assets/export_seedphrase.svg'
import { Icon, ScreenWrapper } from '~/components'
import { ChainAddressesList } from '~/components/ChainsAddressesList'
import Text from '~/components/Text'
import { NUNITO_SANS_SEMIBOLD } from '~/constants/text'
import { useTheme } from '~/contexts'
import { useCryptoWallets } from '~/features/cryptoWallet'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps } from '~/navigation/types'
import { Theme } from '~/styles/types'

export type SingleWalletScreenParams = {
  walletId: string
}

type SingleWalletScreenProps = MainStackScreenProps<'SingleWallet'>

// TODO: Allow this component to be used for watched wallet as well
export const SingleWalletScreen: React.FC<SingleWalletScreenProps> = (
  props
) => {
  const { navigation, route } = props
  const { walletId } = route.params

  const cryptoWallets = useCryptoWallets()
  const cryptoWallet = cryptoWallets.find((wallet) => wallet.id === walletId)

  const handleEditButtonPress = useCallback(() => {
    navigation.navigate('EditCryptoWallet', { walletId })
  }, [navigation, walletId])

  const { theme } = useTheme()
  const styles = useThemeAwareStyle(createStyles)

  useEffect(() => {
    navigation.setOptions({
      title: cryptoWallet?.label || 'Loading...',
      headerRight: () => (
        <TouchableOpacity
          onPress={handleEditButtonPress}
          style={styles.headerEditButton}>
          <Icon name='edit' size={24} color={theme.color.primary} />
        </TouchableOpacity>
      ),
    })
  }, [
    navigation,
    cryptoWallet?.label,
    handleEditButtonPress,
    styles.headerEditButton,
    theme.color.primary,
  ])

  const handleShowSeedPhrasePress = useCallback(() => {
    navigation.navigate('DisplayPrivateInfo', {
      source: 'cryptoWallet',
      type: 'recoveryPhrase',
      sourceId: walletId,
    })
  }, [navigation, walletId])

  return (
    <ScreenWrapper>
      {cryptoWallet ? (
        <>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={handleShowSeedPhrasePress}
              style={styles.actionButton}>
              <ExportSeedphraseSvg />
              <Text style={styles.actionButtonText}>Show Seed Phrase</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.listLabel}>Accounts</Text>
          <ChainAddressesList list={cryptoWallet.accounts || []} />
        </>
      ) : (
        <Text
        // TODO: Add proper styling
        >
          Wallet not found
        </Text>
      )}
    </ScreenWrapper>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    walletHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: 15,
    },
    backIcon: {
      color: '#000',
    },
    walletNameLogo: {
      paddingTop: 20,
      alignItems: 'center',
    },
    headerEditButton: {
      marginRight: theme.spacing.m,
    },
    // editButtonWrapper: {
    //   width: 40,
    // },
    // editButton: {
    //   color: '#423BCE',
    //   fontSize: 17,
    //   fontFamily: NUNITO_SANS_BOLD,
    //   marginTop: 4,
    // },
    title: {
      marginTop: 15,
      fontFamily: NUNITO_SANS_SEMIBOLD,
      fontSize: 22,
    },
    listLabel: {
      textTransform: 'uppercase',
      color: 'rgba(4, 17, 51, 0.6)',
      marginHorizontal: 20,
      marginBottom: 10,
      marginTop: 30,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      marginTop: 20,
    },
    actionButton: {
      alignItems: 'center',
    },
    actionButtonText: {
      marginTop: 5,
      fontSize: 14,
    },
  })
