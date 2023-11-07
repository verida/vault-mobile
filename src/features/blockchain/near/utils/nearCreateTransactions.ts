import { providers, transactions, utils } from 'near-api-js'

import { NearAccount, NearAccountPointer, NearTransaction } from '../@types'
import { nearCreateViewAccessKey } from './nearCreateViewAccessKey'

export async function nearCreateTransactions({
  transactions: defaultTransactions,
  provider,
  nearAccount,
}: {
  readonly transactions: readonly NearTransaction[]
  readonly provider: providers.Provider
  readonly nearAccount: NearAccount
}): Promise<readonly transactions.Transaction[]> {
  const block = await provider.block({ finality: 'final' })

  return Promise.all(
    defaultTransactions.map(
      async ({ receiverId, actions }, i): Promise<transactions.Transaction> => {
        const { publicKey, signerId } = nearAccount

        const nearAccountPointer: NearAccountPointer = {
          signerId,
          publicKey,
        }

        const accessKey = await nearCreateViewAccessKey({
          provider,
          nearAccountPointer,
        })

        return transactions.createTransaction(
          signerId,
          utils.PublicKey.from(publicKey),
          receiverId,
          accessKey.nonce + i + 1,
          actions,
          utils.serialize.base_decode(block.header.hash)
        )
      }
    )
  )
}
