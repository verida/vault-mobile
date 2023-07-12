import { throwIfInvalidEthereumRpcMethod } from 'blockchain/ethereum'
import { useWalletsData } from 'features/wallet'
import * as React from 'react'

import { WalletConnectSessionRequestCallbackParams } from '../@types'
import { getVeridaWalletAccountForWalletConnectRequestOrThrow } from '../utils'
import { useWalletConnectSessionRequestHandlersEthereumLike } from './useWalletConnectSessionRequestHandlers.EthereumLike'

// TODO: rename EthereumLike to EIP155Like

export const useWalletConnectSessionApproveCallbackEthereumLike = (): ((
  params: WalletConnectSessionRequestCallbackParams
) => Promise<unknown>) => {
  const walletsData = useWalletsData()
  const handlers = useWalletConnectSessionRequestHandlersEthereumLike()

  return React.useCallback(
    async ({
      web3wallet,
      request,
      rpc,
    }: WalletConnectSessionRequestCallbackParams) => {
      /* ensure wallet */
      getVeridaWalletAccountForWalletConnectRequestOrThrow({
        request,
        walletsData,
        web3wallet,
      })

      const method = request?.params?.request?.method

      if (!throwIfInvalidEthereumRpcMethod(method)) return

      const { [method]: handle } = handlers

      return handle({ web3wallet, request, rpc })
    },
    [walletsData, handlers]
  )
}
