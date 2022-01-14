import React from 'react'
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native'

import Text from 'components/Text'

import { WHITE_COLOR, PRIMARY_COLOR } from 'constants/color'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'

import SendIcon from 'assets/send_icon.svg'
import ReceiveIcon from 'assets/receive_icon.svg'
import BuyIcon from 'assets/buy_icon.svg'
import CopyIcon from 'assets/copy_icon.svg'

export default ({
  data,
  sendButtonAction,
  // buyButtonAction,
  receiveButtonAction,
  copyButtonAction,
}) => {
  const { label, price, change, amount, symbol, quantity, icon } = data
  const positive = change > 0

  return (
    <View style={styles.bannerWrapper}>
      {symbol && (
        <View style={styles.coinInfo}>
          <Text style={styles.coinText}>Coin</Text>
          <View style={styles.coinPriceInfo}>
            <Text style={styles.coinPrice}>${price.toFixed(2)}</Text>
            <Text
              style={[
                styles.coinPriceChange,
                positive ? styles.positive : styles.negative,
              ]}>
              {positive ? `+ ${change.toFixed(2)}%` : `${change.toFixed(2)}%`}
            </Text>
          </View>
        </View>
      )}
      <View style={styles.totals}>
        {icon && (
          <View style={styles.coinIcon}>
            <Image source={{ uri: icon }} style={styles.icon} />
          </View>
        )}
        <Text style={styles.amount}>
          {label
            ? `${(quantity / 1000000).toFixed(2)} ${symbol}`
            : `$${amount.toFixed(2)}`}
        </Text>
        <Text style={styles.amountLabel}>
          {label ? `≈ $${amount.toFixed(2)}` : `Total Balance`}
        </Text>
      </View>
      {symbol && (
        <View style={styles.actionIcons}>
          <TouchableOpacity
            onPress={sendButtonAction}
            style={styles.singleActionIcon}>
            <SendIcon />
            <Text style={styles.actionIconText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={receiveButtonAction}
            style={styles.singleActionIcon}>
            <ReceiveIcon />
            <Text style={styles.actionIconText}>Receive</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            onPress={buyButtonAction}
            style={styles.singleActionIcon}>
            <BuyIcon />
            <Text style={styles.actionIconText}>Buy</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={copyButtonAction}
            style={styles.singleActionIcon}>
            <CopyIcon />
            <Text style={styles.actionIconText}>Copy</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  bannerWrapper: {
    margin: 15,
    backgroundColor: PRIMARY_COLOR,
    padding: 20,
    borderRadius: 12,
  },
  coinInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  coinText: {
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  coinPriceInfo: {
    flexDirection: 'row',
  },
  coinPrice: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  coinPriceChange: {
    marginLeft: 10,
  },
  positive: {
    color: '#5ECEA5',
  },
  negative: {
    color: '#FD4F64',
  },
  totals: {
    alignItems: 'center',
  },
  coinIcon: {
    marginTop: 12,
    marginBottom: 10,
  },
  amount: {
    color: WHITE_COLOR,
    fontSize: 28,
    fontFamily: NUNITO_SANS_BOLD,
  },
  amountLabel: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  actionIcons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 24,
  },
  actionIconText: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 14,
    color: WHITE_COLOR,
    textAlign: 'center',
    marginTop: 4,
  },
  icon: { width: 45, height: 45 },
})
