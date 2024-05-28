import { ethers } from 'ethers'
import { convertFromCryptoIntegerToDecimal } from 'features/token/utils/convertFromCryptoIntegerToDecimal'
import { convertFromCryptoIntegerToMaybeDecimalFiat } from 'features/token/utils/convertFromCryptoIntegerToMaybeDecimalFiat'
import { convertPredictedTransactionFeeToString } from 'features/token/utils/convertPredictedTransactionFeeToString'
import * as React from 'react'
import { ActivityIndicator } from 'react-native'

import { ChainMetadata } from '~/features/caip'
import { DetailedValuation } from '~/features/cryptoWallet'

import { NumericCryptoInternal } from './Numeric.Crypto.Internal'
import { NumericFiat } from './Numeric.Fiat'

/**
 * @deprecated use Numbers instead
 */
export const NumericCryptoMaxTransactionFee = React.memo(
  function NumericCryptoMaxTransactionFee({
    chainMetadata,
    predictedMaxTransactionFee,
    detailedValuation /* when truthy, render in fiat */,
  }: {
    readonly chainMetadata: ChainMetadata
    readonly predictedMaxTransactionFee: ethers.BigNumber
    readonly detailedValuation: DetailedValuation | null | undefined
  }): JSX.Element {
    const maybePredictedTransactionFee = convertPredictedTransactionFeeToString(
      {
        chainMetadata,
        predictedMaxTransactionFee,
      }
    )

    // TODO: use the real loading state from `usePredictMaxTransactionFee`
    if (!maybePredictedTransactionFee) return <ActivityIndicator />

    const { decimals } = chainMetadata

    if (detailedValuation) {
      const maybeFiatTransactionFee =
        convertFromCryptoIntegerToMaybeDecimalFiat({
          integerCryptoAmount: String(predictedMaxTransactionFee),
          valuation: detailedValuation,
          decimals,
        })

      if (maybeFiatTransactionFee) {
        const { amount, units } = maybeFiatTransactionFee
        return <NumericFiat value={Number(amount)} currency={units} />
      }
    }

    const { amount, units } = maybePredictedTransactionFee

    return (
      <NumericCryptoInternal
        floatingCryptoAmount={convertFromCryptoIntegerToDecimal({
          integerCryptoAmount: amount,
          decimals,
        })}
        symbol={units}
      />
    )
  }
)
