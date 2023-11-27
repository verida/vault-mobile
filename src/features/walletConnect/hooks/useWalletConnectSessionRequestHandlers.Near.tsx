import { Buffer } from 'buffer'
import {
  NearAccountPointer,
  nearCreateAction,
  nearCreateTransactions,
  nearGetAccounts,
  nearMaybeAccountForTransactionSignatory,
  NearRpcMethod,
  nearSignAndSendTransactions,
  nearSignIn,
  nearSignOut,
  nearSignTransactions,
  NearTransaction,
  throwIfNearAccountDoesNotMatchNearAccountPointer,
} from 'features/blockchain/near'
import {
  ChainMetadatas,
  getMaybeChainMetadatas,
  useChainMetadatas,
} from 'features/caip'
import { useWalletsData } from 'features/cryptoWallet'
import { getNearAccountForWalletConnectRequestOrThrow } from 'features/walletConnect'
import { providers, transactions as Transactions } from 'near-api-js'
import * as React from 'react'

import {
  NearSessionRequestHandlers,
  WalletConnectSessionRequestCallbackParams,
} from '../@types'

// TODO: we need to leverage walletconnect's implementation rather than rolling
//       our own copies each time - we should be adapting a common interface

const getNearProvider = (rpc: string) => new providers.JsonRpcProvider(rpc)

const walletConnectSessionRequestToNearAccountPointers = async ({
  chainMetadatas,
  params,
  walletsData,
}: {
  readonly chainMetadatas: ChainMetadatas
  readonly params: WalletConnectSessionRequestCallbackParams
  readonly walletsData: ReturnType<typeof useWalletsData>
}): Promise<readonly NearAccountPointer[]> => {
  return nearGetAccounts(
    await getNearAccountForWalletConnectRequestOrThrow({
      ...params,
      chainMetadatas,
      walletsData,
    })
  )
}

export function useWalletConnectSessionRequestHandlersNear(): NearSessionRequestHandlers {
  const walletsData = useWalletsData()

  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  return React.useMemo<NearSessionRequestHandlers>(
    () => ({
      [NearRpcMethod.NEAR_SIGN_IN]: async ({
        request,
        rpc,
        web3wallet,
      }: WalletConnectSessionRequestCallbackParams) => {
        const provider = getNearProvider(rpc)

        const permission: Transactions.FunctionCallPermission =
          request.params.request.params.permission

        const nearAccount = await getNearAccountForWalletConnectRequestOrThrow({
          chainMetadatas,
          web3wallet,
          walletsData,
          request,
        })

        const nearAccountPointers: readonly NearAccountPointer[] =
          request.params.request.params.accounts

        if (!Array.isArray(nearAccountPointers))
          throw new Error(
            `Expected array nearAccountPointers, encountered "${String(
              nearAccountPointers
            )}".`
          )

        return nearSignIn({
          nearAccount,
          nearAccountPointers,
          permission,
          provider,
        })
      },
      [NearRpcMethod.NEAR_SIGN_OUT]: async ({
        request,
        rpc,
        web3wallet,
      }: WalletConnectSessionRequestCallbackParams) => {
        const provider = getNearProvider(rpc)
        const nearAccountPointers = request.params.request.params

        const nearAccount = await getNearAccountForWalletConnectRequestOrThrow({
          chainMetadatas,
          request,
          walletsData,
          web3wallet,
        })

        if (!Array.isArray(nearAccountPointers))
          throw new Error(
            `Expected array accounts, encountered "${String(
              nearAccountPointers
            )}".`
          )

        return nearSignOut({
          nearAccount,
          nearAccountPointers,
          provider,
        })
      },
      [NearRpcMethod.NEAR_GET_ACCOUNTS]: async (
        params: WalletConnectSessionRequestCallbackParams
      ) =>
        walletConnectSessionRequestToNearAccountPointers({
          chainMetadatas,
          params,
          walletsData,
        }),
      [NearRpcMethod.NEAR_SIGN_TRANSACTION]: async ({
        web3wallet,
        request,
      }: WalletConnectSessionRequestCallbackParams) => {
        const transactionData = request.params.request.params.transaction

        const nearAccount = await getNearAccountForWalletConnectRequestOrThrow({
          chainMetadatas,
          web3wallet,
          request,
          walletsData,
        })

        const [signedTransaction] = await nearSignTransactions({
          nearAccount,
          transactions: [
            Transactions.Transaction.decode(Buffer.from(transactionData)),
          ],
        })

        return signedTransaction.encode()
      },
      [NearRpcMethod.NEAR_SIGN_AND_SEND_TRANSACTION]: async (
        params: WalletConnectSessionRequestCallbackParams
      ) => {
        const { request, rpc, web3wallet } = params

        const provider = getNearProvider(rpc)

        const { transaction } = request.params.request.params
        const { actions } = transaction

        const [nearAccountPointers, nearAccount] = await Promise.all([
          walletConnectSessionRequestToNearAccountPointers({
            chainMetadatas,
            params,
            walletsData,
          }),
          getNearAccountForWalletConnectRequestOrThrow({
            chainMetadatas,
            web3wallet,
            request,
            walletsData,
          }),
        ])

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
        web3wallet,
        request,
      }: WalletConnectSessionRequestCallbackParams) => {
        const nearAccount = await getNearAccountForWalletConnectRequestOrThrow({
          chainMetadatas,
          request,
          web3wallet,
          walletsData,
        })

        const signedTransactions = await nearSignTransactions({
          nearAccount,
          transactions: request.params.request.params.transactions.map(
            (transactionData: Uint8Array) =>
              Transactions.Transaction.decode(Buffer.from(transactionData))
          ),
        })

        return signedTransactions.map((signedTransaction) =>
          signedTransaction.encode()
        )
      },
      [NearRpcMethod.NEAR_SIGN_AND_SEND_TRANSACTIONS]: async (
        params: WalletConnectSessionRequestCallbackParams
      ) => {
        const { rpc, request } = params
        const provider = getNearProvider(rpc)
        const { transactions } = request.params.request.params

        if (!Array.isArray(transactions))
          throw new Error(
            `Expected array transactions, encountered "${String(
              transactions
            )}".`
          )

        const [nearAccountPointers, nearAccount] = await Promise.all([
          walletConnectSessionRequestToNearAccountPointers({
            chainMetadatas,
            params,
            walletsData,
          }),
          getNearAccountForWalletConnectRequestOrThrow({
            ...params,
            chainMetadatas,
            walletsData,
          }),
        ])

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

        const [uniqueNearAccountPointerForTransactions] =
          uniqueNearAccountPointersForTransactions

        throwIfNearAccountDoesNotMatchNearAccountPointer({
          nearAccountPointer: uniqueNearAccountPointerForTransactions,
          nearAccount,
        })

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
    [chainMetadatas, walletsData]
  )
}
