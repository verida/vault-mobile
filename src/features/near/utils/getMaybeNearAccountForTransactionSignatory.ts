import { ParsedCaipType } from 'features/caip'

import { NearTransaction, NearWalletAccountInfo } from '../@types'
import { NearKeystore } from '../classes'
import { getNearAccounts } from './getNearAccounts'

export async function getMaybeNearAccountForTransactionSignatory({
  keystore,
  nearNetworkParsedCaipType,
  transaction,
}: {
  readonly keystore: NearKeystore
  readonly nearNetworkParsedCaipType: ParsedCaipType
  readonly transaction: NearTransaction
}): Promise<NearWalletAccountInfo | undefined> {
  const accounts = await getNearAccounts({
    keystore,
    nearNetworkParsedCaipType,
  })

  const maybeAccount = accounts.find(
    ({ accountId }) => accountId === transaction.signerId
  )

  return maybeAccount || undefined
}
