import { ethers } from 'ethers'
import {
  BlockchainRequestHandlerCallback,
  SupportedBlockchainNamespace,
} from 'features/blockchain/@types'
import { ConfirmTransactionCallbackResult } from 'features/cryptoWallet'
import { MinifiedVeridaAccount } from 'features/cryptoWallet/@types'

export const sendBaseCurrencyEip155 = async ({
  value,
  to,
  eth_sendTransaction,
  minifiedVeridaAccount,
  rpc,
}: {
  readonly to: string
  readonly value: number
  readonly eth_sendTransaction: BlockchainRequestHandlerCallback<ethers.Wallet>
  readonly minifiedVeridaAccount: MinifiedVeridaAccount
  readonly rpc: string
}): Promise<ConfirmTransactionCallbackResult> => {
  const { namespace } = minifiedVeridaAccount

  if (namespace !== SupportedBlockchainNamespace.EIP_155)
    throw new Error(
      `Expected "${SupportedBlockchainNamespace.EIP_155}", encountered "${namespace}".`
    )

  const { privateKey } = minifiedVeridaAccount

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
