import React from 'react'
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native'

import Text from 'components/Text'

import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'

import SwapIcon from 'assets/swap_icon.svg'

const convert = (number, mode, price) => {
  let numberFloat = parseFloat(number)
  if (numberFloat > 0) {
    return mode === 'fiat' ? numberFloat / price : numberFloat * price
  } else {
    return 0
  }
}

export default ({ onUpdateAmount, token }) => {
  const [number, onChangeNumber] = React.useState('0')
  const [mode, onSwitchMode] = React.useState('crypto')
  const { symbol, price, quantity } = token
  const converted = convert(number, mode, price)
  const maxFiat = (quantity * price) / 1000000

  return (
    <View style={styles.bannerWrapper}>
      <TouchableOpacity
        onPress={() => {
          let maxNumber =
            mode === 'fiat'
              ? maxFiat.toFixed(2).toString()
              : (quantity / 1000000).toString()
          onChangeNumber(maxNumber)
          onUpdateAmount(maxNumber)
        }}
        style={styles.button}>
        <Text style={styles.maxButtonText}>Max</Text>
      </TouchableOpacity>
      <View style={styles.amountsWrapper}>
        <View style={styles.mainAmount}>
          {mode === 'fiat' && <Text style={styles.amountText}>$</Text>}
          <TextInput
            style={styles.amountInput}
            onChangeText={(text) => {
              onUpdateAmount(text)
              onChangeNumber(text)
            }}
            value={number}
          />
          {mode === 'crypto' && (
            <Text style={styles.amountText}> {symbol}</Text>
          )}
        </View>
        <Text style={styles.convertedAmount}>
          ≈ {mode === 'crypto' ? `$${converted}` : `${converted} ${symbol}`}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => onSwitchMode(mode === 'fiat' ? 'crypto' : 'fiat')}
        style={styles.button}>
        <SwapIcon />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  bannerWrapper: {
    marginBottom: 15,
    backgroundColor: 'rgba(245, 244, 255, 1)',
    paddingHorizontal: 16,
    paddingVertical: 35,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountsWrapper: {
    alignItems: 'center',
  },
  mainAmount: {
    flexDirection: 'row',
  },
  convertedAmount: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 12,
  },
  amountText: {
    fontSize: 36,
    fontFamily: NUNITO_SANS_BOLD,
    color: 'rgba(4, 17, 51, 0.8)',
  },
  amountInput: {
    fontSize: 36,
    fontFamily: NUNITO_SANS_BOLD,
    color: 'rgba(4, 17, 51, 0.8)',
  },
  button: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: 'rgba(66, 59, 206, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  maxButtonText: {
    textTransform: 'uppercase',
    fontSize: 12,
    fontFamily: NUNITO_SANS_BOLD,
  },
})
