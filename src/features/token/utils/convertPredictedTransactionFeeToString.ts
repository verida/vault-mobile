import { BigNumber } from 'ethers'
import { ChainMetadata } from 'features/caip'
import { fixedPointCryptoAsBigDecimal } from 'features/cryptoWallet'

export function convertPredictedTransactionFeeToString({
  chainMetadata: { decimals, symbol },
  predictedMaxTransactionFee,
}: {
  readonly predictedMaxTransactionFee: BigNumber
  readonly chainMetadata: ChainMetadata
}): {
  readonly feeAmount: string
  readonly feeSymbol: string
} {
  const feeIsUnknown = predictedMaxTransactionFee.lte(BigNumber.from('0'))

  if (feeIsUnknown)
    return {
      feeAmount: 'Unknown',
      feeSymbol: '',
    }

  //if (chainId.namespace === SupportedBlockchainNamespace.EIP_155)
  //  return {
  //    feeAmount: `${Math.round(
  //      parseFloat(ethers.utils.formatUnits(predictedMaxTransactionFee, 'gwei'))
  //    )}`,
  //    feeSymbol: 'gwei',
  //  }

  const feeAmount = `${fixedPointCryptoAsBigDecimal({
    amount: predictedMaxTransactionFee.toString(),
    decimals,
  }).toString()}`

  return {
    feeAmount,
    feeSymbol: symbol,
  }
}
