import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { StyleSheet, Text, View, ViewProps } from 'react-native'

import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { Theme } from 'styles/types'

export type RequestPaymentFeeProps = {
  feeAmount?: string
  feeSymbol?: string
  formattedFiatValue?: string
} & ViewProps

export const RequestPaymentFee: React.FunctionComponent<
  RequestPaymentFeeProps
> = (props) => {
  const { feeAmount, feeSymbol, formattedFiatValue, ...viewProps } = props

  const styles = useThemeAwareStyle(createStyles)

  return (
    <View {...viewProps}>
      <View style={styles.container}>
        <Text style={styles.text}>{`Estimated fee ≈ ${
          feeAmount ? feeAmount : '-'
        } ${feeSymbol}${
          formattedFiatValue ? ` (${formattedFiatValue})` : ''
        }`}</Text>
      </View>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-end',
    },
    text: {
      color: theme.color.textLightGrey,
      fontSize: 14,
      lineHeight: 21,
      fontFamily: NUNITO_SANS_SEMIBOLD,
    },
  })
