import { IWeb3Wallet } from '@walletconnect/web3wallet'
import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/types/client'
import * as React from 'react'

export const useWalletConnectSessionRequestCallbackEthereum = (): ((
  web3wallet: IWeb3Wallet,
  event: Web3WalletTypes.EventArguments['session_request']
) => Promise<void>) =>
  React.useCallback(async () => {
    throw new Error('EVM is currently unsupported.')
  }, [])
