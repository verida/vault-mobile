import {
  nearSignIn,
  NearSigningMethod,
  nearSignOut,
  NearWalletAccountInfo,
  useNearContext,
} from 'features/near'
import {
  NearSessionRequestHandlerParams,
  NearSessionRequestHandlers,
} from 'features/walletConnect'
import { transactions } from 'near-api-js/lib'
import * as React from 'react'

const stub = async (nearSigningMethod: NearSigningMethod) => {
  throw new Error(`Method stub for "${nearSigningMethod}"!`)
}

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
        stub(NearSigningMethod.NEAR_GET_ACCOUNTS),
      [NearSigningMethod.NEAR_SIGN_TRANSACTION]: () =>
        stub(NearSigningMethod.NEAR_SIGN_TRANSACTION),
      [NearSigningMethod.NEAR_SIGN_AND_SEND_TRANSACTION]: () =>
        stub(NearSigningMethod.NEAR_SIGN_AND_SEND_TRANSACTION),
      [NearSigningMethod.NEAR_SIGN_TRANSACTIONS]: () =>
        stub(NearSigningMethod.NEAR_SIGN_TRANSACTIONS),
      [NearSigningMethod.NEAR_SIGN_AND_SEND_TRANSACTIONS]: () =>
        stub(NearSigningMethod.NEAR_SIGN_AND_SEND_TRANSACTIONS),
    }),
    [nearNetworkId]
  )
}
