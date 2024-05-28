import { useActionSheet } from '@expo/react-native-action-sheet'
import Clipboard from '@react-native-community/clipboard'
import { useNavigation } from '@react-navigation/native'
import React, { useCallback, useMemo } from 'react'
import { StyleSheet, TouchableHighlight, View } from 'react-native'

import { Icon } from '~/components/Icon'
import { Typography } from '~/components/Typography'
import { useTheme } from '~/contexts'
import { getBlockchainNamespaceLongLabel } from '~/features/blockchain'
import { LegacyCryptoWalletAccount } from '~/features/cryptoWallet'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

export type ChainAddressesListItemProps = {
  item: LegacyCryptoWalletAccount
}

export const ChainAddressesListItem: React.FC<ChainAddressesListItemProps> = (
  props
) => {
  const { item } = props

  const { showActionSheetWithOptions } = useActionSheet()
  const navigation = useNavigation()

  const options = useMemo(() => {
    const optionItems = ['Copy public address']
    if (item.privateKey) {
      optionItems.push('Show private key')
    }
    optionItems.push('Cancel')
    return optionItems
  }, [item.privateKey])

  const { theme } = useTheme()
  const styles = useThemeAwareStyle(createStyles)

  const handlePress = useCallback(() => {
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
        tintColor: theme.color.black,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          Clipboard.setString(item.address)
          return
        }
        if (item.privateKey && buttonIndex === 1) {
          navigation.navigate('DisplayPrivateInfo', {
            source: 'cryptoWallet',
            type: 'privateKey',
            sourceId: item.address,
          })
          return
        }
      }
    )
  }, [
    navigation,
    options,
    item.address,
    item.privateKey,
    showActionSheetWithOptions,
    theme.color.black,
  ])

  return (
    <TouchableHighlight onPress={handlePress} underlayColor={theme.color.snow}>
      <View style={[styles.container]}>
        <View style={styles.content}>
          <Typography
            variant='h5SemiBold'
            style={styles.label}
            numberOfLines={1}
            ellipsizeMode='tail'>
            {getBlockchainNamespaceLongLabel(item.namespace)}
          </Typography>

          <Typography
            variant='label'
            style={styles.subText}
            numberOfLines={1}
            ellipsizeMode='middle'>
            {item.address}
          </Typography>
        </View>
        <View>
          <Icon name='chevron-forward' size={20} />
        </View>
      </View>
    </TouchableHighlight>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      padding: theme.spacing.m,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.m,
    },
    content: {
      flex: 1,
    },
    label: {
      flex: 1,
    },
    subText: {
      flex: 1,
      color: theme.color.textGrey600,
    },
  })
