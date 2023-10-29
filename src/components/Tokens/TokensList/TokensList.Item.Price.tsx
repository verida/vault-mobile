import { DetailedValuation, Interval } from 'features/cryptoWallet'
import { priceFormatter } from 'features/cryptoWallet/utils/formatter'
import { Text } from 'native-base'
import * as React from 'react'
import { StyleSheet, View } from 'react-native'

import { NUNITO_SANS_SEMIBOLD } from 'constants/text'

export const TokensListItemPrice = React.memo(function TokensListItemPrice({
  valuation: {
    price,
    conversionRate,
    rates: { [Interval.DAILY]: dailyRateChange },
  },
}: {
  readonly valuation: DetailedValuation
}): JSX.Element {
  const positive = dailyRateChange >= 0
  return (
    <>
      <View style={styles.priceAmount}>
        <View style={styles.priceChange}>
          <Text style={styles.amount}>{priceFormatter(conversionRate)}</Text>
          {dailyRateChange !== 0 && (
            <Text
              style={[
                styles.coinPriceChange,
                positive ? styles.positive : styles.negative,
              ]}
              children={`${positive ? '+' : ''}${dailyRateChange.toFixed(2)}`}
            />
          )}
        </View>
        <Text style={styles.amount}>{priceFormatter(price)}</Text>
      </View>
    </>
  )
})

const styles = StyleSheet.create({
  priceAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceChange: {
    flexDirection: 'row',
  },
  amount: {
    color: 'rgba(4, 17, 51, 0.5)',
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 14,
  },
  coinPriceChange: {
    marginLeft: 10,
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 14,
  },
  positive: {
    color: '#5ECEA5',
  },
  negative: {
    color: '#FD4F64',
  },
})
