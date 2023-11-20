import { throwIfInvalidEip155RpcMethod } from 'features/blockchain/eip155'
import { useSelectedMinifiedVeridaAccounts } from 'features/cryptoWallet'
import * as React from 'react'

import { WalletConnectSessionRequestCallbackParams } from '../@types'
import { getMinifiedVeridaAccountForWalletConnectRequestOrThrow } from '../utils'
import { useWalletConnectSessionRequestHandlersEip155 } from './useWalletConnectSessionRequestHandlers.Eip155'

export const useWalletConnectSessionApproveCallbackEip155 = (): ((
  params: WalletConnectSessionRequestCallbackParams
) => Promise<unknown>) => {
  const selectedMinifiedVeridaAccounts = useSelectedMinifiedVeridaAccounts()
  const handlers = useWalletConnectSessionRequestHandlersEip155()

  return React.useCallback(
    async ({
      web3wallet,
      request,
    }: WalletConnectSessionRequestCallbackParams) => {
      /* ensure wallet */
      getMinifiedVeridaAccountForWalletConnectRequestOrThrow({
        request,
        minifiedVeridaAccounts: selectedMinifiedVeridaAccounts,
        web3wallet,
      })

      const method = request?.params?.request?.method

      if (!throwIfInvalidEip155RpcMethod(method)) return

      const { [method]: handle } = handlers

      return handle({ web3wallet, request })
    },
    [handlers, selectedMinifiedVeridaAccounts]
  )
}
