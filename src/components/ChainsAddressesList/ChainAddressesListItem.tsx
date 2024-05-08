import { useActionSheet } from '@expo/react-native-action-sheet'
import Clipboard from '@react-native-community/clipboard'
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
  onPressPrivateKey: (privateKey: string) => void
}

export const ChainAddressesListItem: React.FC<ChainAddressesListItemProps> = (
  props
) => {
  const { item, onPressPrivateKey } = props

  const { showActionSheetWithOptions } = useActionSheet()

  const options = useMemo(() => {
    const optionItems = ['Copy address']
    if (item.privateKey) {
      optionItems.push('Show Private Key')
    }
    optionItems.push('Cancel')
    return optionItems
  }, [item.privateKey])

  const handlePress = useCallback(() => {
    showActionSheetWithOptions(
      {
        options: options,
        cancelButtonIndex: options.length,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          Clipboard.setString(item.address)
          return
        }
        if (item.privateKey && buttonIndex === 1) {
          onPressPrivateKey(item.privateKey)
          return
        }
      }
    )
  }, [
    options,
    item.address,
    item.privateKey,
    onPressPrivateKey,
    showActionSheetWithOptions,
  ])

  const { theme } = useTheme()
  const styles = useThemeAwareStyle(createStyles)

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
