import { NearKeystore, NearNetworkId } from 'features/near'
import { InMemorySigner, transactions } from 'near-api-js/lib'

export const nearSignTransactions = async ({
  keystore,
  transactions: defaultTransactions,
  nearNetworkId,
}: {
  readonly keystore: NearKeystore
  readonly transactions: readonly transactions.Transaction[]
  readonly nearNetworkId: NearNetworkId
}): Promise<readonly transactions.SignedTransaction[]> => {
  const signer = new InMemorySigner(keystore)

  return Promise.all(
    defaultTransactions.map(async (transaction: transactions.Transaction) => {
      const [, signedTx] = await transactions.signTransaction(
        transaction,
        signer,
        transaction.signerId,
        nearNetworkId
      )
      return signedTx
    })
  )
}
