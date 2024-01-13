import { BigNumber } from 'ethers'
import * as React from 'react'

import { usePredictMaxTransactionFee } from './usePredictMaxTransactionFee'

export function usePredictMaxTransactionFeeOrZero(
  params: Parameters<typeof usePredictMaxTransactionFee>[0]
): BigNumber {
  const { predictedMaxTransactionFee: maybePredictedMaxTransactionFee } =
    usePredictMaxTransactionFee(params)

  return React.useMemo(
    () => maybePredictedMaxTransactionFee || BigNumber.from('0'),
    [maybePredictedMaxTransactionFee]
  )
}
