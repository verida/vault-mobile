import React, { useMemo } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { Icon } from '~/components/Icon'
import { Typography } from '~/components/Typography'
import {
  getWalletTypeShortLabel,
  LegacyCryptoWallet,
} from '~/features/cryptoWallet'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

type WalletNavigationHeaderProps = {
  selectedWallet: LegacyCryptoWallet | null
  onPress: () => void
}

const HIT_SLOP = { top: 15, right: 15, bottom: 15, left: 15 }

export const WalletNavigationHeader: React.FC<WalletNavigationHeaderProps> = (
  props
) => {
  const { selectedWallet, onPress } = props

  const title = useMemo(() => {
    return selectedWallet?.label || 'Select a wallet'
  }, [selectedWallet])

  const subtitle = useMemo(() => {
    if (selectedWallet === null) {
      return null
    }
    const addresses = selectedWallet.accounts.map((account) => {
      return account.address
    })
    const dedupAddresses = Array.from(new Set(addresses))
    if (dedupAddresses.length === 1) {
      return dedupAddresses[0]
    }
    return getWalletTypeShortLabel('multi')
  }, [selectedWallet])

  const styles = useThemeAwareStyle(createStyles)

  return (
    <Pressable hitSlop={HIT_SLOP} style={styles.container} onPress={onPress}>
      <View style={styles.titleContainer}>
        <Typography variant='h4' numberOfLines={1} ellipsizeMode='tail'>
          {title}
        </Typography>
        <Icon name='chevron-down' size={16} />
      </View>
      {subtitle ? (
        <Typography
          variant='label'
          style={styles.address}
          numberOfLines={1}
          ellipsizeMode='middle'>
          {subtitle}
        </Typography>
      ) : null}
    </Pressable>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xxxl,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      // Weird issue with using `alignItems: 'baseline'` on a container with `<Icon>`, see https://github.com/react-native-elements/react-native-elements/issues/2134
      gap: theme.spacing.xs,
    },
    address: {
      color: theme.color.textLightGrey,
    },
  })
