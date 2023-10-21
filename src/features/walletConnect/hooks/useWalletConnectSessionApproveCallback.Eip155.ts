import { throwIfInvalidEip155RpcMethod } from 'features/blockchain/eip155'
import { useWalletsData } from 'features/cryptoWallet'
import * as React from 'react'

import { WalletConnectSessionRequestCallbackParams } from '../@types'
import { getVeridaWalletAccountForWalletConnectRequestOrThrow } from '../utils'
import { useWalletConnectSessionRequestHandlersEip155 } from './useWalletConnectSessionRequestHandlers.Eip155'

export const useWalletConnectSessionApproveCallbackEip155 = (): ((
  params: WalletConnectSessionRequestCallbackParams
) => Promise<unknown>) => {
  const walletsData = useWalletsData()
  const handlers = useWalletConnectSessionRequestHandlersEip155()

  return React.useCallback(
    async ({
      web3wallet,
      request,
      rpcSelector,
    }: WalletConnectSessionRequestCallbackParams) => {
      /* ensure wallet */
      getVeridaWalletAccountForWalletConnectRequestOrThrow({
        request,
        walletsData,
        web3wallet,
      })

      const method = request?.params?.request?.method

      if (!throwIfInvalidEip155RpcMethod(method)) return

      const { [method]: handle } = handlers

      return handle({ web3wallet, request, rpcSelector })
    },
    [walletsData, handlers]
  )
}
