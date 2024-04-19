import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { DetailedValuation } from 'features/cryptoWallet'
import {
  convertFromCryptoIntegerToMaybeDecimalFiat,
  convertPredictedTransactionFeeToString,
} from 'features/token'
import { useThemeAwareStyle } from 'hooks'
import React, { useMemo } from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'
import { getSignificantDecimalsFromPrice } from 'utils'

import { Blockchain } from '~/features/blockchain'

import { NumberCrypto, NumberFiat } from 'components/Numbers'
import { Typography } from 'components/Typography'
import { Theme } from 'styles/types'

export type RequestPaymentFeeProps = {
  readonly chainMetadata: Blockchain
  readonly predictedMaxTransactionFee: ethers.BigNumber
  readonly detailedValuation: DetailedValuation | null | undefined
} & ViewProps

export const RequestPaymentFee: React.FC<RequestPaymentFeeProps> = (props) => {
  const {
    chainMetadata,
    predictedMaxTransactionFee,
    detailedValuation,
    ...viewProps
  } = props

  const styles = useThemeAwareStyle(createStyles)

  const {
    maybeCryptoTransactionFee,
    maybeCryptoNbDecimals,
    maybeFiatTransactionFee,
  } = useMemo(() => {
    const { decimals } = chainMetadata

    const nbDecimals = detailedValuation?.conversionRate
      ? getSignificantDecimalsFromPrice(
          detailedValuation.conversionRate.toNumber()
        )
      : undefined

    const cryptoTransactionFee = convertPredictedTransactionFeeToString({
      chainMetadata,
      predictedMaxTransactionFee,
    })

    const fiatTransactionFee = convertFromCryptoIntegerToMaybeDecimalFiat({
      integerCryptoAmount: String(predictedMaxTransactionFee),
      valuation: detailedValuation,
      decimals,
    })

    return {
      maybeCryptoTransactionFee: cryptoTransactionFee,
      maybeCryptoNbDecimals: nbDecimals,
      maybeFiatTransactionFee: fiatTransactionFee,
    }
  }, [chainMetadata, predictedMaxTransactionFee, detailedValuation])

  return (
    <View {...viewProps}>
      <View style={styles.container}>
        <Typography
          variant='bodySemiBold'
          style={styles.text}>{`Estimated fee ≈ `}</Typography>
        {maybeCryptoTransactionFee ? (
          <>
            <NumberCrypto
              value={new BigNumber(maybeCryptoTransactionFee.amount).toNumber()}
              unit={maybeCryptoTransactionFee.units}
              nbDecimals={maybeCryptoNbDecimals}
              variant='bodySemiBold'
              style={styles.text}
            />
            {maybeFiatTransactionFee ? (
              <>
                <Typography
                  variant='bodySemiBold'
                  style={styles.text}>{` (`}</Typography>
                <NumberFiat
                  value={new BigNumber(
                    maybeFiatTransactionFee.amount
                  ).toNumber()}
                  unit={maybeFiatTransactionFee.units || undefined}
                  variant='bodySemiBold'
                  style={styles.text}
                />
                <Typography
                  variant='bodySemiBold'
                  style={styles.text}>{`)`}</Typography>
              </>
            ) : null}
          </>
        ) : (
          <Typography
            variant='bodySemiBold'
            style={styles.text}>{`Unknown`}</Typography>
        )}
      </View>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-end',
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    text: {
      color: theme.color.textLightGrey,
    },
  })
