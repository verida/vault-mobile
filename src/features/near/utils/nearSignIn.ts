import * as Sentry from '@sentry/react-native'
import { ParsedCaipType } from 'features/caip'
import { providers, transactions, utils } from 'near-api-js/lib'

import { NearTransaction, NearWalletAccountInfo } from '../@types'
import { NearKeystore } from '../classes'
import { nearCreateTransactions } from './nearCreateTransactions'
import { nearSignAndSendTransactions } from './nearSignAndSendTransactions'

export const nearSignIn = async ({
  permission,
  accounts,
  provider,
  keystore,
  nearNetworkParsedCaipType,
}: {
  readonly permission: transactions.FunctionCallPermission
  readonly accounts: readonly NearWalletAccountInfo[]
  readonly provider: providers.Provider
  readonly keystore: NearKeystore
  readonly nearNetworkParsedCaipType: ParsedCaipType
}): Promise<readonly NearWalletAccountInfo[]> =>
  (
    await Promise.all(
      accounts.map(async (account: NearWalletAccountInfo) => {
        const transactionToCreate: NearTransaction = {
          signerId: account.accountId,
          receiverId: account.accountId,
          actions: [
            transactions.addKey(
              utils.PublicKey.from(account.publicKey),
              transactions.functionCallAccessKey(
                permission.receiverId,
                permission.methodNames,
                permission.allowance
              )
            ),
          ],
        }
        try {
          const [transactionToSend] = await nearCreateTransactions({
            account,
            provider,
            transactions: [transactionToCreate],
          })

          await nearSignAndSendTransactions({
            transactions: [transactionToSend],
            provider,
            keystore,
            nearNetworkParsedCaipType,
          })

          // HACK: Upon success, return the account that was created.
          return account
        } catch (e) {
          // eslint-disable-next-line no-console
          __DEV__ && console.error(e)
          Sentry.captureException(e)
          return null
        }
      })
    )
  ).flatMap((e) => (e ? [e] : []))
