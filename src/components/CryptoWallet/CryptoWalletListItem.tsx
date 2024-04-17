import React, { useCallback, useMemo } from 'react'
import { StyleSheet, TouchableHighlight, View } from 'react-native'

import { Icon } from '~/components/Icon'
import { Checkmark } from '~/components/Indicators'
import { Typography } from '~/components/Typography'
import { useTheme } from '~/contexts/ThemeContext'
import {
  getWalletTypeShortLabel,
  LegacyCryptoWallet,
} from '~/features/cryptoWallet'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

export type CryptoWalletListItemProps = {
  item: LegacyCryptoWallet
  selected: boolean
  onPress?: (item: LegacyCryptoWallet) => void
  showMoreIcon?: boolean
}

export const CryptoWalletListItem: React.FC<CryptoWalletListItemProps> = (
  props
) => {
  const { item, selected, showMoreIcon, onPress } = props

  const { theme } = useTheme()

  const handlePress = useCallback(() => {
    onPress?.(item)
  }, [item, onPress])

  const subtext = useMemo(() => {
    const addresses = item.accounts.map((account) => {
      return account.address
    })
    const dedupAddresses = Array.from(new Set(addresses))
    if (dedupAddresses.length === 1) {
      return dedupAddresses[0]
    }
    return getWalletTypeShortLabel('multi')
  }, [item])

  const styles = useThemeAwareStyle(createStyles)

  return (
    <TouchableHighlight onPress={handlePress} underlayColor={theme.color.snow}>
      <View style={[styles.container, selected && styles.selected]}>
        <View style={styles.labelContainer}>
          <Typography
            variant='h5SemiBold'
            numberOfLines={1}
            ellipsizeMode='tail'>
            {item.label}
          </Typography>
          <Typography
            variant='label'
            style={styles.subText}
            numberOfLines={1}
            ellipsizeMode='middle'>
            {subtext}
          </Typography>
        </View>
        {selected ? (
          <View>
            <Checkmark size={20} />
          </View>
        ) : null}
        {showMoreIcon ? (
          <View>
            <Icon name='more-horizontal' size={20} />
          </View>
        ) : null}
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
    selected: {
      backgroundColor: theme.color.snow,
    },
    labelContainer: {
      flex: 1,
    },
    subText: {
      color: theme.color.textLightGrey,
    },
  })
