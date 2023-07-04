import { ParsedCaipType } from 'features/caip'
import { InMemorySigner, transactions } from 'near-api-js/lib'

import { NearKeystore } from '../classes'

export const nearSignTransactions = async ({
  keystore,
  transactions: defaultTransactions,
  nearNetworkParsedCaipType,
}: {
  readonly keystore: NearKeystore
  readonly transactions: readonly transactions.Transaction[]
  readonly nearNetworkParsedCaipType: ParsedCaipType
}): Promise<readonly transactions.SignedTransaction[]> => {
  const signer = new InMemorySigner(keystore)

  return Promise.all(
    defaultTransactions.map(async (transaction: transactions.Transaction) => {
      const [, signedTx] = await transactions.signTransaction(
        transaction,
        signer,
        transaction.signerId,
        nearNetworkParsedCaipType.chainId
      )
      return signedTx
    })
  )
}
