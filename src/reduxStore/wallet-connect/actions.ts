import WalletConnect from '@walletconnect/client'
import {
  DApp,
  DAppv2,
  WalletConnectClientMeta,
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
  return createAction('APPROVE_WC_SESSION', payload)
}

export function rejectWalletConnectSession(payload: {
  walletId: string
  connector: WalletConnect
}) {
  return createAction('REJECT_WC_SESSION', payload)
}

export function approveWalletConnectSessionv2(payload: DAppv2) {
  return createAction('APPROVE_WC_SESSSION_V2', payload)
}

export function removeWalletConnectSessionv2(payload: { topic: string }) {
  return createAction('REMOVE_WC_SESSSION_V2', payload)
}
