import { WalletConnectSessionRequestCallbackParams } from 'features/walletConnect'
import * as React from 'react'

export const useWalletConnectSessionRequestApproveCallbackEthereum = (): ((
  params: WalletConnectSessionRequestCallbackParams
) => Promise<void>) =>
  React.useCallback(async () => {
    throw new Error('EVM is currently unsupported.')
  }, [])
