import React, { useCallback, useMemo } from 'react'
import { StyleSheet, TouchableHighlight, View } from 'react-native'

import { Icon } from '~/components/Icon'
import { Checkmark } from '~/components/Indicators'
import { Typography } from '~/components/Typography'
import { useTheme } from '~/contexts/ThemeContext'
import { getBlockchainNamespaceShortLabel } from '~/features/blockchain'
import {
  getWalletTypeShortLabel,
  LegacyCryptoWallet,
} from '~/features/cryptoWallet'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

import { ReadOnlyCryptoWallet } from './ReadOnlyCryptoWallet'

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

  const blockchainNamespaces = useMemo(() => {
    const namespaces = item.accounts.map((account) => {
      return account.namespace
    })
    const dedupNamespaces = Array.from(new Set(namespaces))
    return dedupNamespaces.map((namespace) =>
      getBlockchainNamespaceShortLabel(namespace)
    )
  }, [item])

  const { theme } = useTheme()
  const styles = useThemeAwareStyle(createStyles)

  return (
    <TouchableHighlight onPress={handlePress} underlayColor={theme.color.snow}>
      <View style={[styles.container, selected && styles.selected]}>
        <View style={styles.content}>
          <View style={styles.labelContainer}>
            {item.readOnly ? <ReadOnlyCryptoWallet /> : null}
            <Typography
              variant='h5SemiBold'
              style={styles.label}
              numberOfLines={1}
              ellipsizeMode='tail'>
              {item.label}
            </Typography>
          </View>
          <View style={styles.infoContainer}>
            {blockchainNamespaces.map((namespace) => (
              <View key={namespace} style={styles.namespaceTag}>
                <Typography
                  variant='bodySemiBold'
                  style={styles.namespaceTagText}>
                  {namespace}
                </Typography>
              </View>
            ))}

            <Typography
              variant='label'
              style={styles.subText}
              numberOfLines={1}
              ellipsizeMode='middle'>
              {subtext}
            </Typography>
          </View>
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
    content: {
      flex: 1,
    },
    labelContainer: {
      flex: 1,
      flexDirection: 'row',
      gap: theme.spacing.s,
      alignItems: 'center',
    },
    label: {
      flex: 1,
    },
    infoContainer: {
      flex: 1,
      flexDirection: 'row',
      gap: theme.spacing.xs,
      alignItems: 'center',
    },
    subText: {
      flex: 1,
      color: theme.color.textGrey600,
    },
    namespaceTag: {
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing.s,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.roundness.xs,
      backgroundColor: theme.color.grey120,
    },
    namespaceTagText: {
      color: theme.color.textGrey500,
    },
  })
