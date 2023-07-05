import { throwIfInvalidNearSigningMethod } from 'features/near'
import { useWalletsData } from 'hooks'
import * as React from 'react'

import { WalletConnectSessionRequestCallbackParams } from '../@types'
import { getMaybeNearAccountForWalletConnectRequest } from '../utils'
import { useWalletConnectSessionRequestHandlersNearLike } from './useWalletConnectSessionRequestHandlers.NearLike'

export const useWalletConnectSessionApproveCallbackNearLike = (): ((
  params: WalletConnectSessionRequestCallbackParams
) => Promise<unknown>) => {
  const walletsData = useWalletsData()

  const nearSessionRequestHandlers =
    useWalletConnectSessionRequestHandlersNearLike()

  return React.useCallback(
    async ({
      web3wallet,
      request,
      rpc,
    }: WalletConnectSessionRequestCallbackParams): Promise<unknown> => {
      const maybeNearAccount = await getMaybeNearAccountForWalletConnectRequest(
        {
          web3wallet,
          request,
          walletsData,
        }
      )

      if (!maybeNearAccount)
        // TODO: @cawfree better error
        throw new Error(
          `No active account. Unable to find matching NEAR account.`
        )

      const method = request?.params?.request?.method

      if (!throwIfInvalidNearSigningMethod(method)) return

      const { [method]: handle } = nearSessionRequestHandlers

      return handle({ web3wallet, request, rpc })
    },
    [nearSessionRequestHandlers, walletsData]
  )
}
