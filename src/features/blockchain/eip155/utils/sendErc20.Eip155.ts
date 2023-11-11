import { ethers } from 'ethers'
import { BlockchainRequestHandlerCallback } from 'features/blockchain/@types'
import { SupportedCaipNamespace } from 'features/caip/@types'
import { ConfirmTransactionCallbackResult } from 'features/cryptoWallet'
import { MinifiedVeridaAccount } from 'features/cryptoWallet/@types'
import { numericAmountToFixedPointCrypto } from 'features/cryptoWallet/utils/numericAmountToFixedPointCrypto'

export const sendErc20Eip155 = async ({
  erc20Address,
  value,
  to,
  eth_sendTransaction,
  minifiedVeridaAccount,
  rpc,
  decimals,
}: {
  readonly erc20Address: string
  readonly decimals: number
  readonly to: string
  readonly value: number
  readonly eth_sendTransaction: BlockchainRequestHandlerCallback<ethers.Wallet>
  readonly minifiedVeridaAccount: MinifiedVeridaAccount
  readonly rpc: string
}): Promise<ConfirmTransactionCallbackResult> => {
  const { namespace } = minifiedVeridaAccount

  if (namespace !== SupportedCaipNamespace.EIP_155)
    throw new Error(
      `Expected "${SupportedCaipNamespace.EIP_155}", encountered "${namespace}".`
    )

  const { privateKey } = minifiedVeridaAccount

  const provider = new ethers.providers.JsonRpcProvider(rpc)

  const contract = new ethers.Contract(erc20Address, [
    {
      constant: false,
      inputs: [
        {
          name: '_to',
          type: 'address',
        },
        {
          name: '_value',
          type: 'uint256',
        },
      ],
      name: 'transfer',
      outputs: [
        {
          name: '',
          type: 'bool',
        },
      ],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ])

  const { data } = await contract.populateTransaction.transfer(
    to,
    numericAmountToFixedPointCrypto({
      amount: value,
      decimals,
    }).toHexString()
  )

  const maybeTransactionHash = await eth_sendTransaction({
    context: new ethers.Wallet(privateKey, provider),
    params: [
      {
        data,
        to: erc20Address,
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
