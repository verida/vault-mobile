// TODO: what to do with SupportedTokenObject?
import {
  AggregateWalletBannerBalance,
  formatTokenQuantity,
  Transaction,
  TransactionType,
} from 'features/cryptoWallet'
import { ListItem, Text } from 'native-base'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import ReceivedIcon from 'assets/received_icon.svg'
import SentIcon from 'assets/sent_icon.svg'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { useMainNavigation } from 'navigation/hooks'

const icons: { readonly [key in TransactionType]: JSX.Element } = {
  sent: <SentIcon />,
  received: <ReceivedIcon />,
}

export default ({
  //symbol,
  //decimal,
  aggregateWalletBannerBalance,
  item,
}: {
  //readonly symbol: unknown
  //readonly decimal: number
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
  readonly item: Transaction
}) => {
  const navigation = useMainNavigation()
  const { symbol, decimals } = aggregateWalletBannerBalance
  const { type, quantity, address, id, pending } = item

  return (
    <ListItem
      button
      disabled={pending}
      onPress={() => {
        navigation.navigate('TransactionDetails', {
          id,
          aggregateWalletBannerBalance,
        })
      }}
      style={styles.listItem}>
      {icons[type]}
      <View style={styles.listItemDetail}>
        <View style={styles.nameQuantity}>
          <Text style={styles.currencyName}>
            {type} {pending && '(pending)'}
          </Text>
          <Text
            style={[
              styles.quantity,
              type === 'sent' ? styles.negative : styles.positive,
            ]}>
            {/* HACK: formatTokenQuantity expects a number, but quantity from transactions is a BigInt.*/}
            {formatTokenQuantity(Number(quantity), decimals)} {symbol}
          </Text>
        </View>
        <View style={styles.priceAmount}>
          <Text numberOfLines={1} ellipsizeMode='middle' style={styles.amount}>
            {type === 'sent' ? 'To: ' : 'From : '}
            {address}
          </Text>
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
  currencyName: {
    fontSize: 17,
    fontFamily: NUNITO_SANS_BOLD,
    textTransform: 'capitalize',
  },
  quantity: {
    fontSize: 17,
  },
  positive: {
    color: '#5ECEA5',
  },
  negative: {
    color: '#FD4F64',
  },
  priceAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amount: {
    color: 'rgba(4, 17, 51, 0.5)',
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 14,
  },
})
