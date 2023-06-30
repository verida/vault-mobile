import { NearWalletAccountInfo } from 'features/near'
import { providers, transactions, utils } from 'near-api-js'
import { AccessKeyView } from 'near-api-js/lib/providers/provider'

import { NearTransaction } from '../@types'

export async function nearCreateTransactions({
  transactions: defaultTransactions,
  provider,
  account,
}: {
  readonly transactions: readonly NearTransaction[]
  readonly provider: providers.Provider
  readonly account: NearWalletAccountInfo
}): Promise<readonly transactions.Transaction[]> {
  const block = await provider.block({ finality: 'final' })

  return Promise.all(
    defaultTransactions.map(
      async (
        { signerId, receiverId, actions },
        i
      ): Promise<transactions.Transaction> => {
        const { publicKey: public_key } = account

        const accessKey = await provider.query<AccessKeyView>({
          request_type: 'view_access_key',
          finality: 'final',
          account_id: signerId,
          public_key,
        })

        return transactions.createTransaction(
          signerId,
          utils.PublicKey.from(account.publicKey),
          receiverId,
          accessKey.nonce + i + 1,
          actions,
          utils.serialize.base_decode(block.header.hash)
        )
      }
    )
  )
}
