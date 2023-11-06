import { ChainId } from 'caip'
import { BigNumber, ethers } from 'ethers'
import { SupportedCaipNamespace } from 'features/caip'
import { fixedPointCryptoAsBigDecimal } from 'features/cryptoWallet'

export function convertPredictedTransactionFeeToString({
  decimals,
  chainId,
  predictedMaxTransactionFee,
  symbol,
}: {
  readonly decimals: number
  readonly chainId: ChainId
  readonly predictedMaxTransactionFee: BigNumber
  readonly symbol: string
}) {
  const feeIsUnknown = predictedMaxTransactionFee.lte(BigNumber.from('0'))

  if (feeIsUnknown) return 'Unknown'

  if (chainId.namespace === SupportedCaipNamespace.EIP_155)
    return `${ethers.utils.formatUnits(
      predictedMaxTransactionFee,
      'gwei'
    )} gwei`

  return `${fixedPointCryptoAsBigDecimal({
    amount: predictedMaxTransactionFee.toString(),
    decimals,
  }).toString()} ${symbol}`
}
