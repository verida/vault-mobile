import { BalanceByChainResult } from 'features/cryptoWallet'
import { getTokenUnitName } from 'features/token'
import { ListItem, Text } from 'native-base'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import FastImage from 'react-native-fast-image'

import { NUNITO_SANS_BOLD } from 'constants/text'

import { TokensListItemPrice } from './TokensList.Item.Price'

export default ({
  item,
  onPressItem,
}: {
  readonly item: BalanceByChainResult
  readonly onPressItem: (item: BalanceByChainResult) => void
}) => {
  const { change, label, quantity, price, amount } = item

  const maybeToken = Boolean(item) && 'token' in item ? item.token : undefined

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
        <TokensListItemPrice amount={amount} price={price} change={change} />
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
  icon: {
    width: 45,
    height: 45,
  },
})
