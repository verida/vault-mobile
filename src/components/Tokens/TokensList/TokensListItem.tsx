import { BalanceByChainResult, priceFormatter } from 'features/cryptoWallet'
import { getTokenUnitName } from 'features/token'
import { ListItem, Text } from 'native-base'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import FastImage from 'react-native-fast-image'

import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'

export default ({
  item,
  onPressItem,
}: {
  readonly item: BalanceByChainResult
  readonly onPressItem: (item: BalanceByChainResult) => void
}) => {
  const { change, label, quantity, price, amount } = item

  const maybeToken = Boolean(item) && 'token' in item ? item.token : undefined
  const positive = typeof change === 'number' && change >= 0

  return (
    <ListItem button onPress={() => onPressItem(item)} style={styles.listItem}>
      <FastImage source={{ uri: maybeToken?.icon }} style={styles.icon} />
      <View style={styles.listItemDetail}>
        <View style={styles.nameQuantity}>
          <Text style={styles.currencyName}>{label}</Text>
          <Text>
            {quantity.toFixed(3)} {getTokenUnitName(item)}
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
