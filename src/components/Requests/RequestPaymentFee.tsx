import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { StyleSheet, Text, View, ViewProps } from 'react-native'

import { PredictedMaxTransactionFeeSpan } from 'components/NumericSpan/Numeric.Span'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { Theme } from 'styles/types'

export type RequestPaymentFeeProps = Parameters<
  typeof PredictedMaxTransactionFeeSpan
>[0] &
  ViewProps

export const RequestPaymentFee = React.memo(function RequestPaymentFee({
  chainMetadata,
  predictedMaxTransactionFee,
  detailedValuation,
  ...extras
}: RequestPaymentFeeProps): JSX.Element {
  const styles = useThemeAwareStyle(createStyles)

  return (
    <View {...extras}>
      <View style={styles.container}>
        <Text style={styles.text}>
          <Text children='Estimated fee ≈ ' />
          <PredictedMaxTransactionFeeSpan
            chainMetadata={chainMetadata}
            predictedMaxTransactionFee={predictedMaxTransactionFee}
            detailedValuation={detailedValuation}
          />
        </Text>
      </View>
    </View>
  )
})

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
