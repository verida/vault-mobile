import { throwIfInvalidEthereumSigningMethod } from 'features/ethereum'
import {
  useWalletConnectSessionRequestHandlersEthereumLike,
  WalletConnectSessionRequestCallbackParams,
} from 'features/walletConnect'
import { useWalletsData } from 'hooks'
import * as React from 'react'

// TODO: Are dapps even required now? Check redux usage.

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
      const { topic } = request

      // TODO: idk if this is correct
      const maybeSelectedWallet = walletsData[topic]

      if (!maybeSelectedWallet)
        throw new Error(`Unable to find wallet for topic "${topic}".`)

      const method = request?.params?.request?.method

      if (!throwIfInvalidEthereumSigningMethod(method)) return

      const { [method]: handle } = handlers

      return handle({ web3wallet, request, rpc })
    },
    [walletsData, handlers]
  )
}
