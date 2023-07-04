import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import * as React from 'react'
import { Alert } from 'react-native'

import { rejectSessionRequest } from '../utils'

export function useWalletConnectSessionRejectCallback() {
  return React.useCallback(
    (
      web3wallet: IWeb3Wallet,
      request: Web3WalletTypes.EventArguments['session_request'],
      error: unknown
    ) => {
      const reason = error instanceof Error ? error.message : String(error)

      Alert.alert('Error', reason)

      return rejectSessionRequest({
        web3wallet,
        request,
        reason,
      })
    },
    []
  )
}
