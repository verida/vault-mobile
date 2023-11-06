import { CurrencyFormat, useTokenCalculator } from 'features/token'
import * as React from 'react'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'

import SwapIcon from 'assets/swap_icon.svg'
import Text from 'components/Text'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'

const TokenCalculator = React.memo(function TokenCalculator({
  autoFocus: maybeAutoFocus = false,
  toggleFormat,
  symbol,
  format,
  value,
  canConvertBetweenFiatAndCrypto,
  onUpdateCalculatedValue,
  selectMaxValue,
  getCurrentValueStringAsCryptoOrZero,
  getCurrentValueStringAsFiatOrZero,
  maybeCurrencySymbol,
}: ReturnType<typeof useTokenCalculator> & {
  readonly autoFocus?: boolean
}): JSX.Element {
  const ref = React.useRef<TextInput>(null)

  // HACK: For some reason the text input did not focus on its own.
  React.useEffect(() => {
    if (!maybeAutoFocus) return

    setTimeout(() => ref?.current?.focus?.(), 10)
  }, [ref, maybeAutoFocus])

  return (
    <View style={styles.bannerWrapper}>
      <TouchableOpacity onPress={selectMaxValue} style={styles.button}>
        <Text style={styles.maxButtonText}>Max</Text>
      </TouchableOpacity>
      <View style={styles.amountsWrapper}>
        <View style={styles.mainAmount}>
          {format === CurrencyFormat.FIAT && (
            <Text style={styles.amountText}>$</Text>
          )}
          <TextInput
            ref={ref}
            style={styles.amountInput}
            onChangeText={(text) => onUpdateCalculatedValue(text)}
            value={value || ''}
            keyboardType='numeric'
            placeholder='0'
            maxLength={7}
          />
          {format === CurrencyFormat.CRYPTO && (
            <Text style={styles.amountText}> {symbol}</Text>
          )}
        </View>
        {canConvertBetweenFiatAndCrypto && (
          <Text style={styles.convertedAmount}>
            {`≈ ${
              format === CurrencyFormat.CRYPTO
                ? `${
                    maybeCurrencySymbol || ''
                  }${getCurrentValueStringAsFiatOrZero()}`
                : `${getCurrentValueStringAsCryptoOrZero()} ${symbol}`
            }`}
            {}
          </Text>
        )}
      </View>
      <TouchableOpacity
        disabled={!canConvertBetweenFiatAndCrypto}
        onPress={toggleFormat}
        style={[
          styles.button,
          !canConvertBetweenFiatAndCrypto && styles.invisible,
        ]}>
        <SwapIcon />
      </TouchableOpacity>
    </View>
  )
})

export default TokenCalculator

const styles = StyleSheet.create({
  invisible: { opacity: 0 },
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
