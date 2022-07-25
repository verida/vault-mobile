import WalletConnect from '@walletconnect/client'
import {
  DApp,
  IChainData,
  WalletConnectClientMeta,
  WalletConnectRequest,
  WalletConnectSession,
} from 'wallet-connect/types'

import { createAction } from '../helpers'

export function removeWalletConnectDapp(payload: {
  walletId: string
  key: string
}) {
  return createAction('REMOVE_WC_APP', payload)
}

export function setWalletConnectDapp(payload: {
  walletId: string
  key: string
  session: WalletConnectSession
}) {
  return createAction('SET_WC_APP', payload)
}

export function setWalletConnectRequests(payload: {
  walletId: string
  requests: WalletConnectRequest[]
}) {
  return createAction('SET_WC_REQUESTS', payload)
}

export function addWalletConnectRequest(payload: {
  walletId: string
  dapp: DApp
  request: WalletConnectRequest
}) {
  return createAction('ADD_WC_REQUEST', payload)
}

export function removeWalletConnectRequest(payload: {
  walletId: string
  dapp: DApp
  request: WalletConnectRequest
}) {
  return createAction('REMOVE_WC_REQUEST', payload)
}

export function setWalletConnectPeerMeta(payload: {
  walletId: string
  connector: WalletConnect
  peerMeta: WalletConnectClientMeta
}) {
  return createAction('SET_WC_PEER_META', payload)
}

export function approveWalletConnectSession(payload: {
  walletId: string
  connector: WalletConnect
  chainId: number
  chain: DApp['chain']
  accounts: string[]
}) {
  payload.connector.approveSession({
    chainId: payload.chainId,
    accounts: payload.accounts,
  })
  return createAction('APPROVE_WC_PEER_META', payload)
}

export function rejectWalletConnectSession(payload: {
  walletId: string
  connector: WalletConnect
}) {
  return createAction('REJECT_WC_PEER_META', payload)
}

export function showWalletConnectRequest(payload: {
  walletId: string
  dapp: DApp
  request: WalletConnectRequest
}) {
  return createAction('SHOW_WC_REQUEST', payload)
}

export function hideWalletConnectRequest(payload: {
  walletId: string
  dapp: DApp
  request: WalletConnectRequest
}) {
  return createAction('HIDE_WC_REQUEST', payload)
}

export function setWalletConnectNetwork(payload: {
  walletId: string
  network: IChainData
}) {
  return createAction('SET_WC_NETWORK', payload)
}
