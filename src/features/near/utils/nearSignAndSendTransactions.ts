import { ParsedCaipType } from 'features/caip'
import { providers, transactions } from 'near-api-js/lib'

import { NearKeystore } from '../classes'
import { nearSignTransactions } from './nearSignTransactions'

export const nearSignAndSendTransactions = async ({
  transactions: defaultTransactions,
  provider,
  keystore,
  nearNetworkParsedCaipType,
}: {
  readonly provider: providers.Provider
  readonly transactions: readonly transactions.Transaction[]
  readonly keystore: NearKeystore
  readonly nearNetworkParsedCaipType: ParsedCaipType
}) => {
  const signedTransactions = await nearSignTransactions({
    transactions: defaultTransactions,
    keystore,
    nearNetworkParsedCaipType,
  })

  return Promise.all(
    signedTransactions.map((signedTransaction) =>
      provider.sendTransaction(signedTransaction)
    )
  )
}
