import { throwIfInvalidEthereumSigningMethod } from 'features/ethereum'
import { useWalletsData } from 'hooks'
import * as React from 'react'

import { WalletConnectSessionRequestCallbackParams } from '../@types'
import { getEthereumWalletForWalletConnectRequestOrThrow } from '../utils'
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
      getEthereumWalletForWalletConnectRequestOrThrow({
        request,
        walletsData,
      })

      const method = request?.params?.request?.method

      if (!throwIfInvalidEthereumSigningMethod(method)) return

      const { [method]: handle } = handlers

      return handle({ web3wallet, request, rpc })
    },
    [walletsData, handlers]
  )
}
