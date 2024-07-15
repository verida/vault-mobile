import * as React from 'react'

import { throwIfInvalidNearRpcMethod } from '~/features/blockchain/near'
import { useSelectedMinifiedBlockchainAccounts } from '~/features/cryptoWallet'

import { WalletConnectSessionRequestCallbackParams } from '../types'
import { getMaybeNearAccountForWalletConnectRequest } from '../utils'
import { useWalletConnectSessionRequestHandlersNear } from './useWalletConnectSessionRequestHandlers.Near'

export const useWalletConnectSessionApproveCallbackNear = (): ((
  params: WalletConnectSessionRequestCallbackParams
) => Promise<unknown>) => {
  const minifiedBlockchainAccounts = useSelectedMinifiedBlockchainAccounts()

  const nearSessionRequestHandlers =
    useWalletConnectSessionRequestHandlersNear()

  return React.useCallback(
    async ({
      web3wallet,
      request,
    }: WalletConnectSessionRequestCallbackParams): Promise<unknown> => {
      const maybeNearAccount = await getMaybeNearAccountForWalletConnectRequest(
        {
          web3wallet,
          request,
          minifiedBlockchainAccounts,
        }
      )

      if (!maybeNearAccount)
        // TODO: @cawfree better error
        throw new Error(
          `No active account. Unable to find matching NEAR account.`
        )

      const method = request?.params?.request?.method

      if (!throwIfInvalidNearRpcMethod(method)) return

      const { [method]: handle } = nearSessionRequestHandlers

      return handle({ web3wallet, request })
    },
    [nearSessionRequestHandlers, minifiedBlockchainAccounts]
  )
}
