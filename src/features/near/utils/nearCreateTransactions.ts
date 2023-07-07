import { getNearAccountId, nearCreateViewAccessKey } from 'features/near'
import { providers, transactions, utils } from 'near-api-js'

import { NearAccount, NearTransaction } from '../@types'

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
      async (
        { signerId, receiverId, actions },
        i
      ): Promise<transactions.Transaction> => {
        const { publicKey } = nearAccount

        const accountId = getNearAccountId({ signerId })

        const nearAccountPointer = {
          accountId: getNearAccountId({ signerId }),
          publicKey,
        }

        const accessKey = await nearCreateViewAccessKey({
          provider,
          nearAccountPointer,
        })

        return transactions.createTransaction(
          accountId,
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
