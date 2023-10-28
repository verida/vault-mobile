import { priceFormatter } from 'features/cryptoWallet/utils/formatter'
import { Text } from 'native-base'
import * as React from 'react'
import { StyleSheet, View } from 'react-native'

import { NUNITO_SANS_SEMIBOLD } from 'constants/text'

export const TokensListItemPrice = React.memo(function TokensListItemPrice({
  amount /* amount of the token owned in terms of price */,
  change /* relative price change */,
  price /* price of the token */,
}: {
  readonly amount: number
  readonly change: number | null | undefined
  readonly price: number
}): JSX.Element {
  const positive = typeof change === 'number' && change >= 0
  return (
    <>
      <View style={styles.priceAmount}>
        <View style={styles.priceChange}>
          <Text style={styles.amount}>{priceFormatter(price)}</Text>
          {change ? (
            <Text
              style={[
                styles.coinPriceChange,
                positive ? styles.positive : styles.negative,
              ]}>
              {positive ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`}
            </Text>
          ) : undefined}
        </View>
        <Text style={styles.amount}>{priceFormatter(amount)}</Text>
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
