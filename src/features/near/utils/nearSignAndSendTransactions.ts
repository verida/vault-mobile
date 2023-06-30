import {
  NearKeystore,
  NearNetworkId,
  nearSignTransactions,
} from 'features/near'
import { providers, transactions } from 'near-api-js/lib'

export const nearSignAndSendTransactions = async ({
  transactions: defaultTransactions,
  provider,
  keystore,
  nearNetworkId,
}: {
  readonly provider: providers.Provider
  readonly transactions: readonly transactions.Transaction[]
  readonly keystore: NearKeystore
  readonly nearNetworkId: NearNetworkId
}) => {
  const signedTransactions = await nearSignTransactions({
    transactions: defaultTransactions,
    keystore,
    nearNetworkId,
  })

  return Promise.all(
    signedTransactions.map((signedTransaction) =>
      provider.sendTransaction(signedTransaction)
    )
  )
}
