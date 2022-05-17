/* eslint-disable @typescript-eslint/no-unused-vars */
import { ThunkAction } from '@reduxjs/toolkit'
import WalletConnect from '@walletconnect/client'

import { WalletConnectRequest } from '../../wallet-connect/types'
import { hideWalletConnectRequest } from './actions'

export function approveWalletConnectRequest(payload: {
  connector: WalletConnect
  requestPayload: WalletConnectRequest
  address: string
  activeIndex: number
  chainId: number
}) {
  return async () => {
    // const { connector, address, activeIndex, chainId, requestPayload } = payload
    // try {
    //   await getWalletConnectConfig().rpcEngine.signer(requestPayload, {
    //     connector,
    //     address,
    //     activeIndex,
    //     chainId,
    //   })
    // } catch (error) {
    //   if (connector) {
    //     connector.rejectRequest({
    //       id: requestPayload.id,
    //       error: { message: 'Failed or Rejected Request' },
    //     })
    //   }
    //   sentry.captureException(error)
    // }
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
