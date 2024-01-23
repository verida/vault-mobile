import { DetailedValuation, Interval } from 'features/cryptoWallet'
import { useThemeAwareStyle } from 'hooks'
import * as React from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'
import { formatPercentage } from 'utils'

import { NumericFiat } from 'components/Span'
import { Typography } from 'components/Typography'
import { Theme } from 'styles/types'

type TokensListItemPriceProps = {
  readonly valuation: DetailedValuation
} & ViewProps

export const TokensListItemPrice: React.FC<TokensListItemPriceProps> = (
  props
) => {
  const {
    valuation: {
      currency,
      price,
      conversionRate,
      rates: { [Interval.DAILY]: dailyRateChange },
    },
    ...viewProps
  } = props

  const styles = useThemeAwareStyle(createStyles)

  const priceChange = dailyRateChange
    ? formatPercentage(dailyRateChange / 100, {
        signDisplay: 'always',
      })
    : undefined
  const priceChangeDirection =
    dailyRateChange && dailyRateChange > 0 ? 'positive' : 'negative'

  return (
    <View {...viewProps}>
      <View style={styles.tokenValuation}>
        <View style={styles.tokenPriceDetails}>
          <Typography variant='bodySemiBold' style={styles.tokenPrice}>
            <NumericFiat
              value={conversionRate.toNumber()}
              currency={currency}
            />
          </Typography>
          {priceChange ? (
            <Typography
              variant='bodySemiBold'
              style={[
                styles.tokenPriceChange,
                priceChangeDirection === 'positive'
                  ? styles.tokenPriceChangePositive
                  : styles.tokenPriceChangeNegative,
              ]}>
              {priceChange}
            </Typography>
          ) : null}
        </View>
        <Typography variant='bodySemiBold' style={styles.balanceValue}>
          <NumericFiat value={price.toNumber()} currency={currency} />
        </Typography>
      </View>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    tokenValuation: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    tokenPriceDetails: {
      flexDirection: 'row',
    },
    tokenPrice: {
      color: theme.color.textLightGrey,
    },
    tokenPriceChange: {
      marginLeft: theme.spacing.sm,
    },
    tokenPriceChangePositive: {
      color: theme.color.success,
    },
    tokenPriceChangeNegative: {
      color: theme.color.error,
    },
    balanceValue: {
      color: theme.color.textLightGrey,
    },
  })
