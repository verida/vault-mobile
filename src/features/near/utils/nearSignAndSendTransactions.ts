import { providers, transactions } from 'near-api-js'

import { NearAccount } from '../@types'
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

  //const connection = await connect(getNearNetworkConfig(nearAccount))
  //const balance = await (
  //  await connection.account(nearAccount.accountId)
  //).getAccountBalance()

  return Promise.all(
    signedTransactions.map((tx) => provider.sendTransaction(tx))
  )

  //const x: providers.JsonRpcProvider = provider as providers.JsonRpcProvider
  //x.sendJsonRpc('broadcast_tx_commit', result[0].transaction)

  //console.warn(Math.random())
}
