import { ChainId } from 'caip'
import { BigNumber } from 'ethers'
import { fixedPointCryptoAsBigDecimal } from 'features/cryptoWallet'

export function convertPredictedTransactionFeeToString({
  decimals,
  chainId: _chainId,
  predictedMaxTransactionFee,
  symbol,
}: {
  readonly decimals: number
  readonly chainId: ChainId
  readonly predictedMaxTransactionFee: BigNumber
  readonly symbol: string
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

  return {
    feeAmount: `${fixedPointCryptoAsBigDecimal({
      amount: predictedMaxTransactionFee.toString(),
      decimals,
    }).toString()}`,
    feeSymbol: symbol,
  }
}
