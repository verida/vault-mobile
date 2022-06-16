import { ThunkAction } from '@reduxjs/toolkit'
import * as sentry from '@sentry/react-native'
import WalletConnect from '@walletconnect/client'

import { getWalletConnectConfig } from '../../wallet-connect/config'
import { WalletConnectRequest } from '../../wallet-connect/types'
import { hideWalletConnectRequest } from './actions'
import { dappsSelector } from './selectors'

export function approveWalletConnectRequest(payload: {
  connector: WalletConnect
  requestPayload: WalletConnectRequest
  address: string
  activeIndex: number
  chainId: number
}) {
  return async (_: any, getState: any) => {
    const { connector, address, activeIndex, chainId, requestPayload } = payload
    const dapps = dappsSelector(getState())
    const dapp = dapps.find((app) => app.session.key === connector.key)
    try {
      await getWalletConnectConfig().rpcEngine.signer(
        requestPayload,
        {
          connector,
          address,
          activeIndex,
          chainId,
        },
        dapp
      )
    } catch (error) {
      if (connector) {
        connector.rejectRequest({
          id: requestPayload.id,
          error: { message: 'Failed or Rejected Request' },
        })
      }
      sentry.captureException(error)
    }

    // dispatch(
    //   hideWalletConnectRequest({
    //     dapp: { session: payload.connector.session },
    //     request: requestPayload,
    //   })
    // )
  }
}

export function rejectWalletConnectRequest(payload: {
  connector: WalletConnect
  requestPayload: WalletConnectRequest
}): ThunkAction<
  Promise<void>,
  Record<string, unknown>,
  Record<string, unknown>,
  ReturnType<typeof hideWalletConnectRequest>
> {
  return async () => {
    const { connector, requestPayload } = payload
    connector.rejectRequest({
      id: requestPayload.id,
      error: { message: 'Failed or Rejected Request' },
    })

    // dispatch(
    //   hideWalletConnectRequest({
    //     dapp: { session: payload.connector.session },
    //     request: requestPayload,
    //   })
    // )
  }
}
