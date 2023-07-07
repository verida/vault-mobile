import { parseCaipOrThrow } from 'features/caip'
import { NearAccount } from 'features/near'
import { InMemorySigner, transactions } from 'near-api-js'

export const nearSignTransactions = async ({
  nearAccount,
  transactions: defaultTransactions,
}: {
  readonly nearAccount: NearAccount
  readonly transactions: readonly transactions.Transaction[]
}): Promise<readonly transactions.SignedTransaction[]> => {
  const { keystore, nearNetworkId } = nearAccount
  const signer = new InMemorySigner(keystore)

  const { chainId } = parseCaipOrThrow(nearNetworkId)

  return Promise.all(
    defaultTransactions.map(async (transaction: transactions.Transaction) => {
      const [, signedTx] = await transactions.signTransaction(
        transaction,
        signer,
        transaction.signerId,
        chainId
      )

      return signedTx
    })
  )
}
