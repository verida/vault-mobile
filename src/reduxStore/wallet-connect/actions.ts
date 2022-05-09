import { ThunkAction } from '@reduxjs/toolkit'
import sentry from '@sentry/react-native'
import WalletConnect from '@walletconnect/client'
import {
  DApp,
  WalletConnectClientMeta,
  WalletConnectRequest,
} from 'wallet-connect/types'

import { getWalletConnectConfig } from '../../wallet-connect/config'
import { createAction } from '../helpers'

export function removeWalletConnectDapp(payload: { key: string }) {
  return createAction('Remove_WC_APP', payload)
}

export function setWalletConnectRequests(payload: {
  requests: WalletConnectRequest[]
}) {
  return createAction('SET_WC_REQUESTS', payload)
}

export function addWalletConnectRequest(payload: {
  dapp: DApp
  request: WalletConnectRequest
}) {
  return createAction('ADD_WC_REQUEST', payload)
}

export function removeWalletConnectRequest(payload: {
  dapp: DApp
  request: WalletConnectRequest
}) {
  return createAction('REMOVE_WC_REQUEST', payload)
}

export function setWalletConnectPeerMeta(payload: {
  connector: WalletConnect
  peerMeta: WalletConnectClientMeta
}) {
  return createAction('SET_WC_PEER_META', payload)
}

export function approveWalletConnectSession(payload: {
  connector: WalletConnect
  chainId: number
  accounts: string[]
}) {
  payload.connector.approveSession({
    chainId: payload.chainId,
    accounts: payload.accounts,
  })
  return createAction('APPROVE_WC_PEER_META', payload)
}

export function rejectWalletConnectSession(payload: {
  connector: WalletConnect
  chainId: number
  accounts: string[]
}) {
  return createAction('REJECT_WC_PEER_META', payload)
}

export function showWalletConnectRequest(payload: {
  dapp: DApp
  request: WalletConnectRequest
}) {
  return createAction('SHOW_WC_REQUEST', payload)
}

export function hideWalletConnectRequest(payload: {
  dapp: DApp
  request: WalletConnectRequest
}) {
  return createAction('HIDE_WC_REQUEST', payload)
}

export function approveWalletConnectRequest(payload: {
  connector: WalletConnect
  requestPayload: WalletConnectRequest
  address: string
  activeIndex: number
  chainId: number
}): ThunkAction<
  Promise<void>,
  Record<string, unknown>,
  Record<string, unknown>,
  ReturnType<typeof hideWalletConnectRequest>
> {
  return async (dispatch, getState) => {
    const { connector, address, activeIndex, chainId, requestPayload } = payload
    try {
      await getWalletConnectConfig().rpcEngine.signer(requestPayload, {
        connector,
        address,
        activeIndex,
        chainId,
      })
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
  return async (dispatch, getState) => {
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
