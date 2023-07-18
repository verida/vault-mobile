import { throwIfInvalidNearRpcMethod } from 'features/blockchain/near'
import { getMaybeChainMetadatas, useChainMetadatas } from 'features/caip'
import { useWalletsData } from 'features/cryptoWallet'
import * as React from 'react'

import { WalletConnectSessionRequestCallbackParams } from '../@types'
import { getMaybeNearAccountForWalletConnectRequest } from '../utils'
import { useWalletConnectSessionRequestHandlersNear } from './useWalletConnectSessionRequestHandlers.Near'

export const useWalletConnectSessionApproveCallbackNear = (): ((
  params: WalletConnectSessionRequestCallbackParams
) => Promise<unknown>) => {
  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())
  const walletsData = useWalletsData()

  const nearSessionRequestHandlers =
    useWalletConnectSessionRequestHandlersNear()

  return React.useCallback(
    async ({
      web3wallet,
      request,
      rpc,
    }: WalletConnectSessionRequestCallbackParams): Promise<unknown> => {
      const maybeNearAccount = await getMaybeNearAccountForWalletConnectRequest(
        {
          chainMetadatas,
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

      if (!throwIfInvalidNearRpcMethod(method)) return

      const { [method]: handle } = nearSessionRequestHandlers

      return handle({ web3wallet, request, rpc })
    },
    [chainMetadatas, nearSessionRequestHandlers, walletsData]
  )
}
