import { BigNumber } from 'ethers'

export const calculateTransactionFeeEip155 = ({
  maxFeePerGas,
  gasLimit,
}: {
  readonly maxFeePerGas: BigNumber
  readonly gasLimit: BigNumber
}): BigNumber => {
  if (!maxFeePerGas) throw new Error('Missing maxFeePerGas.')

  return maxFeePerGas.mul(gasLimit)
}
