import { BN } from 'bn.js'
import { ChainId } from 'caip'
import {
  BlockchainRequestHandlerCallback,
  SupportedBlockchainNamespace,
} from 'features/blockchain/@types'
import { ConfirmTransactionCallbackResult } from 'features/cryptoWallet'
import { MinifiedVeridaAccount } from 'features/cryptoWallet/@types'
import { getMaybeNearAccountForPrivateKey } from 'features/walletConnect/utils/getMaybeNearAccountForWalletConnectRequest'
import { providers as nearProviders, utils as nearUtils } from 'near-api-js'

import { NearAccountBundle } from '../@types'

export const sendNativeCurrencyNear = async ({
  chainId: caipChainId,
  to: receiverId,
  value,
  near_signAndSendTransaction,
  rpc,
  minifiedVeridaAccount,
}: {
  readonly chainId: ChainId
  readonly to: string
  readonly value: number
  readonly near_signAndSendTransaction: BlockchainRequestHandlerCallback<NearAccountBundle>
  readonly rpc: string
  readonly minifiedVeridaAccount: MinifiedVeridaAccount
}): Promise<ConfirmTransactionCallbackResult> => {
  const { namespace } = minifiedVeridaAccount

  if (namespace !== SupportedBlockchainNamespace.NEAR)
    throw new Error(
      `Expected "${SupportedBlockchainNamespace.NEAR}", encountered "${namespace}".`
    )

  const nearProvider = new nearProviders.JsonRpcProvider(rpc)

  const amount = nearUtils.format.parseNearAmount(String(value))

  if (typeof amount !== 'string' || !amount.length)
    throw new Error(
      `Expected non-empty string amount, encountered "${amount}".`
    )

  const { privateKey, address: signerId } = minifiedVeridaAccount

  const maybeNearAccount = await getMaybeNearAccountForPrivateKey({
    caipChainId,
    privateKey,
    signerId,
  })

  if (!maybeNearAccount) throw new Error('Unable to find matching NearAccount.')

  const transaction = {
    actions: [
      {
        params: {
          deposit: new BN(amount).toString(),
        },
        type: 'Transfer',
      },
    ],
    receiverId,
    signerId,
  }

  const {
    // @ts-expect-error untyped
    transaction: { hash: transactionHash },
  } = await near_signAndSendTransaction({
    context: {
      nearAccount: maybeNearAccount,
      nearProvider,
    },
    params: {
      transaction,
    },
  })

  if (typeof transactionHash !== 'string')
    throw new Error(
      `Expected string transactionHash, encountered "${JSON.stringify(
        transactionHash
      )}".`
    )

  return { transactionHash }
}
