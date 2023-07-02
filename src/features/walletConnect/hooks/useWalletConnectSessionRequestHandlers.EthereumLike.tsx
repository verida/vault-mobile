import { EthereumSigningMethod } from 'features/ethereum'
import {
  EthereumSessionRequestHandlers,
  WalletConnectSessionRequestCallbackParams,
} from 'features/walletConnect'
import * as React from 'react'

export function useWalletConnectSessionRequestHandlersEthereumLike(): EthereumSessionRequestHandlers {
  return React.useMemo<EthereumSessionRequestHandlers>(
    () => ({
      [EthereumSigningMethod.TODO]:
        // eslint-disable-next-line no-empty-pattern
        async ({}: WalletConnectSessionRequestCallbackParams) => {
          throw new Error('evm not supported')
          //const method = request?.params?.request?.method

          //if (!throwIfInvalidNearSigningMethod(method)) return
        },
    }),
    []
  )
}
