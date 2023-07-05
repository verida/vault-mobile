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
} from 'features/near'
import { providers, transactions } from 'near-api-js/lib'
import * as React from 'react'

import {
  NearSessionRequestHandlers,
  WalletConnectSessionRequestCallbackParams,
} from '../@types'

const getNearProvider = (rpc: string) => new providers.JsonRpcProvider(rpc)

export function useWalletConnectSessionRequestHandlersNearLike(): NearSessionRequestHandlers {
  return React.useMemo<NearSessionRequestHandlers>(
    () => ({
      [NearSigningMethod.NEAR_SIGN_IN]: async ({
        request,
        rpc,
      }: WalletConnectSessionRequestCallbackParams) => {
        const provider = getNearProvider(rpc)

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
          nearNetworkParsedCaipType,
        })
      },
      [NearSigningMethod.NEAR_SIGN_OUT]: async ({
        request,
        rpc,
      }: WalletConnectSessionRequestCallbackParams) => {
        const provider = getNearProvider(rpc)
        const accounts = request.params.request.params

        if (!Array.isArray(accounts))
          throw new Error(
            `Expected array accounts, encountered "${String(accounts)}".`
          )

        return nearSignOut({
          accounts,
          provider,
          nearNetworkParsedCaipType,
          keystore,
        })
      },
      [NearSigningMethod.NEAR_GET_ACCOUNTS]: () =>
        getNearAccounts({
          keystore,
          nearNetworkParsedCaipType,
        }),
      [NearSigningMethod.NEAR_SIGN_TRANSACTION]: async ({
        request,
      }: WalletConnectSessionRequestCallbackParams) => {
        const transactionData = request.params.request.params.transaction

        const [signedTransaction] = await nearSignTransactions({
          keystore,
          nearNetworkParsedCaipType,
          transactions: [
            transactions.Transaction.decode(Buffer.from(transactionData)),
          ],
        })

        return signedTransaction.encode()
      },
      [NearSigningMethod.NEAR_SIGN_AND_SEND_TRANSACTION]: async ({
        request,
        rpc,
      }: WalletConnectSessionRequestCallbackParams) => {
        const provider = getNearProvider(rpc)

        const { transaction } = request.params.request.params
        const { actions } = transaction

        const account = await getMaybeNearAccountForTransactionSignatory({
          keystore,
          nearNetworkParsedCaipType,
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
          nearNetworkParsedCaipType,
        })

        return result
      },
      [NearSigningMethod.NEAR_SIGN_TRANSACTIONS]: async ({
        request,
      }: WalletConnectSessionRequestCallbackParams) => {
        const signedTransactions = await nearSignTransactions({
          keystore,
          nearNetworkParsedCaipType,
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
        rpc,
        request,
      }: WalletConnectSessionRequestCallbackParams) => {
        const provider = getNearProvider(rpc)
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
                nearNetworkParsedCaipType,
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
          nearNetworkParsedCaipType,
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
    []
  )
}
