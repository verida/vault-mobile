import { ListItem, Text } from 'native-base'
import React from 'react'
import { Image, StyleSheet, View } from 'react-native'

import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { priceFormatter } from 'reduxStore/wallet/selectors'

export default ({ item, onPressItem }) => {
  const { change, label, token, symbol, quantity, price, amount } = item
  const positive = change >= 0

  return (
    <ListItem button onPress={() => onPressItem(item)} style={styles.listItem}>
      <Image source={{ uri: token.icon }} style={styles.icon} />
      <View style={styles.listItemDetail}>
        <View style={styles.nameQuantity}>
          <Text style={styles.currencyName}>{label}</Text>
          <Text>
            {quantity.toFixed(3)} {symbol}
          </Text>
        </View>
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
      </View>
    </ListItem>
  )
}

const styles = StyleSheet.create({
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 0,
    marginLeft: 0,
    paddingLeft: 16,
  },
  listItemDetail: { flex: 1, marginLeft: 15 },
  nameQuantity: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  currencyName: { fontSize: 17, fontFamily: NUNITO_SANS_BOLD },
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
  icon: {
    width: 45,
    height: 45,
  },
})
