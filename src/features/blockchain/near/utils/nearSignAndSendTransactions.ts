import { providers, transactions } from 'near-api-js'

import { NearAccount } from '../types'
import { nearSignTransactions } from './nearSignTransactions'

export const nearSignAndSendTransactions = async ({
  nearAccount,
  transactions: defaultTransactions,
  provider,
}: {
  readonly provider: providers.Provider
  readonly nearAccount: NearAccount
  readonly transactions: readonly transactions.Transaction[]
}) => {
  const signedTransactions = await nearSignTransactions({
    transactions: defaultTransactions,
    nearAccount,
  })

  return Promise.all(
    signedTransactions.map((tx) => provider.sendTransaction(tx))
  )
}
