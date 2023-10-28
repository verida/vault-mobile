import { ethers } from 'ethers'
import { BlockchainRequestHandlerCallback } from 'features/blockchain/@types'
import { SupportedCaipNamespace } from 'features/caip/@types'
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
}) => {
  const { namespace } = minifiedVeridaAccount

  if (namespace !== SupportedCaipNamespace.EIP_155)
    throw new Error(
      `Expected "${SupportedCaipNamespace.EIP_155}", encountered "${namespace}".`
    )

  const { privateKey } = minifiedVeridaAccount

  const provider = new ethers.providers.JsonRpcProvider(rpc)

  const maybeTransactionHash = await eth_sendTransaction({
    context: new ethers.Wallet(privateKey, provider),
    params: {
      value: ethers.utils.parseEther(String(value)),
      to,
    },
    // TODO: this should NOT be needed if we already have the provider... verify usage
    rpcSelector: async () => rpc /* already_selected */,
  })

  if (typeof maybeTransactionHash !== 'string' || !maybeTransactionHash.length)
    throw new Error(
      `Expected non-empty string transactionHash, encountered "${String(
        maybeTransactionHash
      )}".`
    )
}
