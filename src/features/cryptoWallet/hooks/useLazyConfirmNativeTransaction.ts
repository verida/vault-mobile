import { Stateful } from 'features/polygonid/@types'
import * as React from 'react'

import { BalanceByChainResult } from '../@types'

type ConfirmNativeTransactionCallbackParams = {
  readonly amount: number
  readonly toAddress: string
  readonly token: BalanceByChainResult
}

type ConfirmNativeTransactionCallbackResult = boolean

type ConfirmNativeTransactionCallback = (
  params: ConfirmNativeTransactionCallbackParams
) => Promise<ConfirmNativeTransactionCallbackResult>

// Lazily sends a transaction of the native currency.
// TODO: Use a more exciting ReturnType.
export function useLazyConfirmNativeTransaction(): Stateful<ConfirmNativeTransactionCallbackResult> & {
  readonly confirmNativeTransaction: ConfirmNativeTransactionCallback
} {
  const [state] = React.useState<
    Stateful<ConfirmNativeTransactionCallbackResult>
  >({ loading: false, result: false })

  // TODO: note this should fail if the transaction does not succeed in being mined
  //const result = await dispatch(
  //  sendTransaction({
  //    transactionData: {
  //      token: balanceByChainResult,
  //      amount,
  //      address,
  //    },
  //  })
  //)

  //if (result.meta.requestStatus === 'rejected')
  //  throw new Error(String(result.payload))
  const confirmNativeTransaction: ConfirmNativeTransactionCallback =
    React.useCallback(async () => {
      if (Math.random() >= 0)
        throw new Error('dont know how to send transaction')

      return true
    }, [])

  return { ...state, confirmNativeTransaction }
}
