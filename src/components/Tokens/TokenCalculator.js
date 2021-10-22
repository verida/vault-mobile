import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native'

import Text from 'components/Text'

import { WHITE_COLOR, PRIMARY_COLOR } from 'constants/color'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'

import SwapIcon from 'assets/swap_icon.svg'

export default () => {
  const [number, onChangeNumber] = React.useState('0')
  const converted = parseFloat(number) / 2000

  return (
    <View style={styles.bannerWrapper}>
      <TouchableOpacity
        onPress={() => onChangeNumber('20700')}
        style={styles.button}>
        <Text style={styles.maxButtonText}>Max</Text>
      </TouchableOpacity>
      <View style={styles.amountsWrapper}>
        <View style={styles.mainAmount}>
          <Text style={styles.amountText}>$</Text>
          <TextInput
            style={styles.amountInput}
            onChangeText={onChangeNumber}
            value={number}
          />
        </View>
        <Text style={styles.convertedAmount}>≈ {converted} ETH</Text>
      </View>
      <TouchableOpacity style={styles.button}>
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
