import * as React from 'react'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'

import SwapIcon from 'assets/swap_icon.svg'
import Text from 'components/Text'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'

enum Format {
  CRYPTO = 'crypto',
  FIAT = 'fiat',
}

const convert = (value: `${number}`, mode: Format, price: number) => {
  const numberFloat = parseFloat(value)
  if (numberFloat > 0) {
    return mode === 'fiat' ? numberFloat / price : numberFloat * price
  } else {
    return 0
  }
}

const TokenCalculator = React.memo(function TokenCalculator({
  autoFocus: maybeAutoFocus = false,
  onUpdateAmount,
  onUpdateValidation,

  // TODO: pair these back up
  symbol,
  price,
  quantity,
}: {
  readonly autoFocus?: boolean
  readonly onUpdateAmount: React.Dispatch<React.SetStateAction<number | null>>
  readonly onUpdateValidation: React.Dispatch<React.SetStateAction<boolean>>

  readonly symbol: string
  readonly price: number
  readonly quantity: number
}): JSX.Element {
  const [number, onChangeNumber] = React.useState<`${number}`>('0')
  const [mode, onSwitchMode] = React.useState<Format>(Format.CRYPTO)
  const converted = convert(number, mode, price)
  const maxFiat = quantity * price
  const maxNumber = mode === 'fiat' ? maxFiat.toFixed(2) : quantity

  const ref = React.useRef<TextInput>(null)

  function updateAmount(num: `${number}`) {
    onChangeNumber(num)
    onUpdateAmount(parseFloat(num))
    const isValidAmount = parseFloat(num) <= parseFloat(String(maxNumber))
    onUpdateValidation(isValidAmount)
  }

  // HACK: For some reason the text input did not focus on its own.
  React.useEffect(() => {
    if (!maybeAutoFocus) return

    setTimeout(() => ref?.current?.focus?.(), 10)
  }, [ref, maybeAutoFocus])

  return (
    <View style={styles.bannerWrapper}>
      <TouchableOpacity
        onPress={() => {
          updateAmount(maxNumber.toString() as `${number}`)
        }}
        style={styles.button}>
        <Text style={styles.maxButtonText}>Max</Text>
      </TouchableOpacity>
      <View style={styles.amountsWrapper}>
        <View style={styles.mainAmount}>
          {mode === Format.FIAT && <Text style={styles.amountText}>$</Text>}
          <TextInput
            ref={ref}
            style={styles.amountInput}
            onChangeText={(text) => updateAmount(text as `${number}`)}
            value={number}
            keyboardType='numeric'
          />
          {mode === Format.CRYPTO && (
            <Text style={styles.amountText}> {symbol}</Text>
          )}
        </View>
        <Text style={styles.convertedAmount}>
          {`≈ ${
            mode === Format.CRYPTO ? `$${converted}` : `${converted} ${symbol}`
          }`}
          {}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          onSwitchMode(mode === Format.FIAT ? Format.CRYPTO : Format.FIAT)
        }}
        style={styles.button}>
        <SwapIcon />
      </TouchableOpacity>
    </View>
  )
})

export default TokenCalculator

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
