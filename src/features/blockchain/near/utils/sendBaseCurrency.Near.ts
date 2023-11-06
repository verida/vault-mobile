import { BN } from 'bn.js'
import { ChainId } from 'caip'
import { BlockchainRequestHandlerCallback } from 'features/blockchain/@types'
import { ChainMetadatas, SupportedCaipNamespace } from 'features/caip/@types'
import { MinifiedVeridaAccount } from 'features/cryptoWallet/@types'
import { getMaybeNearAccountForPrivateKey } from 'features/walletConnect/utils/getMaybeNearAccountForWalletConnectRequest'
import { providers as nearProviders, utils as nearUtils } from 'near-api-js'

import { NearAccountBundle } from '../@types'

export const sendBaseCurrencyNear = async ({
  chainMetadatas,
  chainId: caipChainId,
  to: receiverId,
  value,
  near_signAndSendTransaction,
  rpc,
  minifiedVeridaAccount,
}: {
  readonly chainMetadatas: ChainMetadatas
  readonly chainId: ChainId
  readonly to: string
  readonly value: number
  readonly near_signAndSendTransaction: BlockchainRequestHandlerCallback<NearAccountBundle>
  readonly rpc: string
  readonly minifiedVeridaAccount: MinifiedVeridaAccount
}) => {
  const { namespace } = minifiedVeridaAccount

  if (namespace !== SupportedCaipNamespace.NEAR)
    throw new Error(
      `Expected "${SupportedCaipNamespace.NEAR}", encountered "${namespace}".`
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
    chainMetadatas,
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

  return near_signAndSendTransaction({
    context: {
      nearAccount: maybeNearAccount,
      nearProvider,
    },
    params: {
      transaction,
    },
  })
}
