import { Logger } from 'features/telemetry'
import { providers, transactions, utils } from 'near-api-js/lib'

import { NearAccount, NearAccountPointer } from '../@types'
import { nearCreateTransactions } from './nearCreateTransactions'
import { nearSignAndSendTransactions } from './nearSignAndSendTransactions'

const logger = new Logger('Blockchains')

export async function nearSignOut({
  nearAccount,
  nearAccountPointers,
  provider,
}: {
  readonly nearAccount: NearAccount
  readonly nearAccountPointers: readonly NearAccountPointer[]
  readonly provider: providers.Provider
}): Promise<readonly NearAccountPointer[]> {
  return (
    await Promise.all(
      nearAccountPointers.map(
        async (nearAccountPointer: NearAccountPointer) => {
          const { accountId, publicKey } = nearAccountPointer

          try {
            const [transaction] = await nearCreateTransactions({
              nearAccount,
              provider,
              transactions: [
                {
                  signerId: accountId,
                  receiverId: accountId,
                  actions: [
                    transactions.deleteKey(utils.PublicKey.from(publicKey)),
                  ],
                },
              ],
            })

            await nearSignAndSendTransactions({
              transactions: [transaction],
              provider,
              nearAccount,
            })

            // Reference: https://github.com/verida/vault-mobile/blob/4f422accde253ced426ee25de5000ef5eeb2543d/src/wallet-connect/controllers/near.ts#L341
            return null
          } catch (error: unknown) {
            logger.error(
              new Error(
                `Failed to remove FunctionCall access key for ${accountId}`,
                { cause: error }
              )
            )

            // Reference: https://github.com/verida/vault-mobile/blob/4f422accde253ced426ee25de5000ef5eeb2543d/src/wallet-connect/controllers/near.ts#L349
            return nearAccountPointer
          }
        }
      )
    )
  ).flatMap((e) => (e ? [e] : []))
}
