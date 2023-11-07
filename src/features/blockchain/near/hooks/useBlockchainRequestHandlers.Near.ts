import { transactions as Transactions } from 'near-api-js'
import * as React from 'react'

import {
  BlockchainRequestHandlersNear,
  NearAccountPointer,
  NearRpcMethod,
  NearTransaction,
} from '../@types'
import {
  nearCreateAction,
  nearCreateTransactions,
  nearGetAccounts,
  nearMaybeAccountForTransactionSignatory,
  nearSignAndSendTransactions,
  nearSignTransactions,
  throwIfNearAccountDoesNotMatchNearAccountPointer,
} from '../utils'

export function useBlockchainRequestHandlersNear(): BlockchainRequestHandlersNear {
  return React.useMemo<BlockchainRequestHandlersNear>(
    () => ({
      [NearRpcMethod.NEAR_GET_ACCOUNTS]: async ({ context: { nearAccount } }) =>
        nearGetAccounts(nearAccount),
      [NearRpcMethod.NEAR_SIGN_TRANSACTION]: async ({
        context: { nearAccount },
        params,
      }) => {
        const transactionData = params.transaction
        const [signedTransaction] = await nearSignTransactions({
          nearAccount,
          transactions: [
            Transactions.Transaction.decode(Buffer.from(transactionData)),
          ],
        })

        return signedTransaction.encode()
      },
      [NearRpcMethod.NEAR_SIGN_AND_SEND_TRANSACTION]: async ({
        context: { nearAccount, nearProvider: provider },
        params,
      }) => {
        const { transaction } = params
        const { actions } = transaction

        const nearAccountPointers = await nearGetAccounts(nearAccount)

        const nearAccountPointer: NearAccountPointer | undefined =
          nearMaybeAccountForTransactionSignatory({
            nearAccountPointers,
            transaction,
          })

        if (!nearAccountPointer)
          throw new Error(
            `Failed to find matching account for transaction signed by "${String(
              transaction?.signerId
            )}".`
          )

        // HACK: Ensure the NearAccountPointer being requested for signing matches
        //       the allocated signer.
        throwIfNearAccountDoesNotMatchNearAccountPointer({
          nearAccountPointer,
          nearAccount,
        })

        const nextActions = actions.map(nearCreateAction)

        const [transactionToSignAndSend] = await nearCreateTransactions({
          provider,
          nearAccount,
          transactions: [
            {
              ...transaction,
              actions: nextActions,
            },
          ],
        })

        const [result] = await nearSignAndSendTransactions({
          transactions: [transactionToSignAndSend],
          provider,
          nearAccount,
        })

        return result
      },
      [NearRpcMethod.NEAR_SIGN_TRANSACTIONS]: async ({
        context: { nearAccount },
        params,
      }) => {
        const signedTransactions = await nearSignTransactions({
          nearAccount,
          transactions: params.transactions.map((transactionData: Uint8Array) =>
            Transactions.Transaction.decode(Buffer.from(transactionData))
          ),
        })

        return signedTransactions.map((signedTransaction) =>
          signedTransaction.encode()
        )
      },
      [NearRpcMethod.NEAR_SIGN_AND_SEND_TRANSACTIONS]: async ({
        context: { nearAccount, nearProvider: provider },
        params,
      }) => {
        const { transactions } = params

        if (!Array.isArray(transactions))
          throw new Error(
            `Expected array transactions, encountered "${String(
              transactions
            )}".`
          )

        const nearAccountPointers = await nearGetAccounts(nearAccount)

        const nearAccountPointersForTransactions = (
          await Promise.all(
            transactions.map((transaction: NearTransaction) =>
              nearMaybeAccountForTransactionSignatory({
                nearAccountPointers,
                transaction,
              })
            )
          )
        ).flatMap((e) => (e ? [e] : []))

        const uniqueNearAccountPointersForTransactions = [
          ...new Set(nearAccountPointersForTransactions),
        ]

        if (uniqueNearAccountPointersForTransactions.length > 1)
          throw new Error(
            `Expected single NearAccountPointer, encountered ${uniqueNearAccountPointersForTransactions.length}.`
          )

        return nearSignAndSendTransactions({
          provider,
          nearAccount,
          transactions: await nearCreateTransactions({
            provider,
            nearAccount,
            transactions: transactions.map((transaction) => ({
              ...transaction,
              actions: transaction.actions.map(nearCreateAction),
            })),
          }),
        })
      },
    }),
    []
  )
}
