import { WalletConnectSessionRequestCallbackParams } from 'features/walletConnect'
import * as React from 'react'

export const useWalletConnectSessionRequestApproveCallbackEthereumLike = (): ((
  params: WalletConnectSessionRequestCallbackParams
) => Promise<unknown>) =>
  React.useCallback(async () => {
    throw new Error('EVM is currently unsupported.')
  }, [])
