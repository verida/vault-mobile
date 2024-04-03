import { ethers } from 'ethers'

import {
  ConfirmTransactionCallbackResult,
  MinifiedBlockchainAccount,
} from '~/features/cryptoWallet'

import {
  BlockchainRequestHandlerCallback,
  SupportedBlockchainNamespace,
} from '../../@types'

export const sendNativeCurrencyEip155 = async ({
  value,
  to,
  eth_sendTransaction,
  minifiedBlockchainAccount,
  rpc,
}: {
  readonly to: string
  readonly value: number
  readonly eth_sendTransaction: BlockchainRequestHandlerCallback<ethers.Wallet>
  readonly minifiedBlockchainAccount: MinifiedBlockchainAccount
  readonly rpc: string
}): Promise<ConfirmTransactionCallbackResult> => {
  const { namespace } = minifiedBlockchainAccount

  if (namespace !== SupportedBlockchainNamespace.EIP_155)
    throw new Error(
      `Expected "${SupportedBlockchainNamespace.EIP_155}", encountered "${namespace}".`
    )

  const { privateKey } = minifiedBlockchainAccount

  const provider = new ethers.providers.JsonRpcProvider(rpc)

  const maybeTransactionHash = await eth_sendTransaction({
    context: new ethers.Wallet(privateKey, provider),
    params: [
      {
        value: ethers.utils.parseEther(String(value.toFixed(18))).toHexString(),
        to,
      },
    ],
  })

  if (typeof maybeTransactionHash !== 'string' || !maybeTransactionHash.length)
    throw new Error(
      `Expected non-empty string transactionHash, encountered "${String(
        maybeTransactionHash
      )}".`
    )

  return { transactionHash: maybeTransactionHash }
}
