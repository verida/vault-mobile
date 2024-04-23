import { InMemorySigner, transactions } from 'near-api-js'

import { NearAccount } from '../types'

export const nearSignTransactions = async ({
  nearAccount,
  transactions: defaultTransactions,
}: {
  readonly nearAccount: NearAccount
  readonly transactions: readonly transactions.Transaction[]
}): Promise<readonly transactions.SignedTransaction[]> => {
  const {
    keystore,
    caipChainId: { reference: chainId },
  } = nearAccount
  const signer = new InMemorySigner(keystore)

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
