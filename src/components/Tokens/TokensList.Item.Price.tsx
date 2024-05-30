import * as React from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'

import { NumberFiat, NumberPercent } from '~/components/Numbers'
import { DetailedValuation, Interval } from '~/features/cryptoWallet'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

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

  const priceChangeDirection =
    dailyRateChange && dailyRateChange > 0 ? 'positive' : 'negative'

  return (
    <View {...viewProps}>
      <View style={styles.tokenValuation}>
        <View style={styles.tokenPriceDetails}>
          <NumberFiat
            value={conversionRate.toNumber()}
            unit={currency}
            options={{
              minimumSignificantDigits: 2,
              maximumSignificantDigits: 6,
            }}
            variant='bodySemiBold'
            style={styles.tokenPrice}
          />
          {dailyRateChange ? (
            <NumberPercent
              value={dailyRateChange / 100}
              options={{
                signDisplay: 'always',
              }}
              variant='bodySemiBold'
              style={[
                styles.tokenPriceChange,
                priceChangeDirection === 'positive'
                  ? styles.tokenPriceChangePositive
                  : styles.tokenPriceChangeNegative,
              ]}
            />
          ) : null}
        </View>
        <NumberFiat
          value={price.toNumber()}
          unit={currency}
          variant='bodySemiBold'
          style={styles.balanceValue}
        />
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
