import { BigNumber } from 'ethers'

import { Blockchain } from '~/features/blockchain'
import { fixedPointCryptoAsBigDecimal } from '~/features/cryptoWallet'

import { AmountWithSymbol } from '../types'

export function convertPredictedTransactionFeeToString({
  chainMetadata: { decimals, symbol },
  predictedMaxTransactionFee,
}: {
  readonly predictedMaxTransactionFee: BigNumber
  readonly chainMetadata: Blockchain
}): AmountWithSymbol | null {
  const feeIsUnknown = predictedMaxTransactionFee.lte(BigNumber.from('0'))

  // TODO: This logic sucks. Fix it.
  if (feeIsUnknown) return null

  //if (chainId.namespace === SupportedBlockchainNamespace.EIP_155)
  //  return {
  //    feeAmount: `${Math.round(
  //      parseFloat(ethers.utils.formatUnits(predictedMaxTransactionFee, 'gwei'))
  //    )}`,
  //    feeSymbol: 'gwei',
  //  }

  const amount = `${fixedPointCryptoAsBigDecimal({
    amount: predictedMaxTransactionFee.toString(),
    decimals,
  }).toString()}` as `${number}`

  return { amount, units: symbol }
}
