import { Logger } from 'features/telemetry'
import { providers, transactions, utils } from 'near-api-js/lib'

import { NearAccount, NearAccountPointer, NearTransaction } from '../@types'
import { nearCreateTransactions } from './nearCreateTransactions'
import { nearSignAndSendTransactions } from './nearSignAndSendTransactions'

const logger = new Logger('Blockchains')

export const nearSignIn = async ({
  nearAccount,
  nearAccountPointers,
  permission,
  provider,
}: {
  readonly nearAccount: NearAccount
  readonly nearAccountPointers: readonly NearAccountPointer[]
  readonly permission: transactions.FunctionCallPermission
  readonly provider: providers.Provider
}): Promise<readonly NearAccountPointer[]> =>
  (
    await Promise.all(
      nearAccountPointers.map(
        async (nearAccountPointer: NearAccountPointer) => {
          const { accountId, publicKey } = nearAccountPointer

          const transactionToCreate: NearTransaction = {
            signerId: accountId,
            receiverId: accountId,
            actions: [
              transactions.addKey(
                utils.PublicKey.from(publicKey),
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
              nearAccount,
              provider,
              transactions: [transactionToCreate],
            })

            await nearSignAndSendTransactions({
              transactions: [transactionToSend],
              provider,
              nearAccount,
            })

            // HACK: Upon success, return the account that was created.
            return nearAccountPointer
          } catch (error: unknown) {
            logger.error(error)
            return null
          }
        }
      )
    )
  ).flatMap((e) => (e ? [e] : []))
