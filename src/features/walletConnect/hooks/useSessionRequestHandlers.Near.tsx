import { createAction } from '@near-wallet-selector/wallet-utils'
import { Buffer } from 'buffer'
import {
  getMaybeNearAccountForTransactionSignatory,
  getNearAccounts,
  nearCreateTransactions,
  nearSignAndSendTransactions,
  nearSignIn,
  NearSigningMethod,
  nearSignOut,
  nearSignTransactions,
  NearTransaction,
  NearWalletAccountInfo,
  useNearContext,
} from 'features/near'
import {
  NearSessionRequestHandlerParams,
  NearSessionRequestHandlers,
} from 'features/walletConnect'
import { transactions } from 'near-api-js/lib'
import * as React from 'react'

export function useSessionRequestHandlersNear(): NearSessionRequestHandlers {
  const { nearNetwork: nearNetworkId, keystore } = useNearContext()
  return React.useMemo<NearSessionRequestHandlers>(
    () => ({
      [NearSigningMethod.NEAR_SIGN_IN]: async ({
        request,
        provider,
      }: NearSessionRequestHandlerParams) => {
        const permission: transactions.FunctionCallPermission =
          request.params.request.params.permission

        const accounts: NearWalletAccountInfo =
          request.params.request.params.accounts

        if (!Array.isArray(accounts))
          throw new Error(
            `Expected array accounts, encountered "${String(accounts)}".`
          )

        return nearSignIn({
          permission,
          provider,
          accounts,
          keystore,
          nearNetworkId,
        })
      },
      [NearSigningMethod.NEAR_SIGN_OUT]: async ({
        request,
        provider,
      }: NearSessionRequestHandlerParams) => {
        const accounts = request.params.request.params

        if (!Array.isArray(accounts))
          throw new Error(
            `Expected array accounts, encountered "${String(accounts)}".`
          )

        return nearSignOut({
          accounts,
          provider,
          nearNetworkId,
          keystore,
        })
      },
      [NearSigningMethod.NEAR_GET_ACCOUNTS]: () =>
        getNearAccounts({
          keystore,
          networkId: nearNetworkId,
        }),
      [NearSigningMethod.NEAR_SIGN_TRANSACTION]: async ({
        request,
      }: NearSessionRequestHandlerParams) => {
        const transactionData = request.params.request.params.transaction

        const [signedTransaction] = await nearSignTransactions({
          keystore,
          nearNetworkId,
          transactions: [
            transactions.Transaction.decode(Buffer.from(transactionData)),
          ],
        })

        return signedTransaction.encode()
      },
      [NearSigningMethod.NEAR_SIGN_AND_SEND_TRANSACTION]: async ({
        request,
        provider,
      }: NearSessionRequestHandlerParams) => {
        const { transaction } = request.params.request.params
        const { actions } = transaction

        const account = await getMaybeNearAccountForTransactionSignatory({
          keystore,
          nearNetworkId,
          transaction,
        })

        if (!account)
          throw new Error(
            `Failed to find matching account for transaction signed by "${String(
              transaction?.signerId
            )}".`
          )

        const [transactionToSignAndSend] = await nearCreateTransactions({
          provider,
          account,
          transactions: [
            {
              ...transaction,
              actions: actions.map(createAction),
            },
          ],
        })

        const [result] = await nearSignAndSendTransactions({
          transactions: [transactionToSignAndSend],
          provider,
          keystore,
          nearNetworkId,
        })

        return result
      },
      [NearSigningMethod.NEAR_SIGN_TRANSACTIONS]: async ({
        request,
      }: NearSessionRequestHandlerParams) => {
        const signedTransactions = await nearSignTransactions({
          keystore,
          nearNetworkId,
          transactions: request.params.request.params.transactions.map(
            (transactionData: Uint8Array) =>
              transactions.Transaction.decode(Buffer.from(transactionData))
          ),
        })

        return signedTransactions.map((signedTransaction) =>
          signedTransaction.encode()
        )
      },
      [NearSigningMethod.NEAR_SIGN_AND_SEND_TRANSACTIONS]: async ({
        provider,
        request,
      }: NearSessionRequestHandlerParams) => {
        const { transactions } = request.params.request.params

        if (!Array.isArray(transactions))
          throw new Error(
            `Expected array transactions, encountered "${String(
              transactions
            )}".`
          )

        const accounts = (
          await Promise.all(
            transactions.map((transaction: NearTransaction) =>
              getMaybeNearAccountForTransactionSignatory({
                keystore,
                nearNetworkId,
                transaction,
              })
            )
          )
        ).flatMap((e) => (e ? [e] : []))

        const accountIds = [...new Set(accounts)]

        if (accountIds.length > 1)
          throw new Error(
            `Expected single accountId, encountered ${accountIds.length}.`
          )

        const [account] = accountIds

        return nearSignAndSendTransactions({
          provider,
          keystore,
          nearNetworkId,
          transactions: await nearCreateTransactions({
            provider,
            account,
            transactions: transactions.map((transaction) => ({
              ...transaction,
              actions: transaction.actions.map(createAction),
            })),
          }),
        })
      },
    }),
    [keystore, nearNetworkId]
  )
}
