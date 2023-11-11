import { Logo } from 'components'
import { AggregateWalletBannerBalance } from 'features/cryptoWallet'
import { ListItem, Text } from 'native-base'
import React from 'react'
import { GestureResponderEvent, StyleSheet, View } from 'react-native'

import { NUNITO_SANS_BOLD } from 'constants/text'

import { TokenListItemBalanceSpan } from './TokenListItem.Balance.Span'
import { TokensListItemPrice } from './TokensList.Item.Price'

export const TokensListItem = React.memo(function TokensListItem({
  aggregateWalletBannerBalance,
  onPress,
}: {
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
  readonly onPress: (e: GestureResponderEvent) => void
}): JSX.Element {
  const { icon: uri, label, symbol, valuation } = aggregateWalletBannerBalance

  return (
    <ListItem button onPress={onPress} style={styles.listItem}>
      <Logo uri={uri || undefined} alt={symbol} style={styles.icon} />
      <View style={styles.listItemDetail}>
        <View style={styles.nameQuantity}>
          <Text style={styles.currencyName}>{label}</Text>
          <Text>
            <TokenListItemBalanceSpan
              {...aggregateWalletBannerBalance}
              symbol={symbol}
            />
          </Text>
        </View>
        {!!valuation && <TokensListItemPrice valuation={valuation} />}
      </View>
    </ListItem>
  )
})

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
