import BigDecimal from 'bignumber.js'
import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'

import { NumberFiat } from 'components/Numbers'
import { Typography } from 'components/Typography'
import { Theme } from 'styles/types'

export type CryptoWalletValueBannerProps = {
  value: BigDecimal
  unit?: string
} & ViewProps

export const CryptoWalletValueBanner: React.FunctionComponent<CryptoWalletValueBannerProps> =
  (props) => {
    const { value, unit, ...viewProps } = props

    const styles = useThemeAwareStyle(createStyles)

    return (
      <View {...viewProps}>
        <View style={styles.container}>
          <Typography variant='label' style={styles.label}>
            Total Value
          </Typography>
          <NumberFiat
            value={value ? value.toNumber() : 0}
            unit={unit}
            variant='h3'
            style={styles.value}
          />
        </View>
      </View>
    )
  }

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingVertical: theme.spacing.m,
      borderRadius: theme.roundness.l,
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: theme.color.primary200,
    },
    label: {
      color: theme.color.primary300,
    },
    value: {
      color: theme.color.primary,
    },
  })
