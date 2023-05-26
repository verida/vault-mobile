import WalletConnect from '@walletconnect/client'
import {
  DApp,
  DAppv2,
  WalletConnectClientMeta,
  WalletConnectSession,
} from 'wallet-connect/types'

import { createAction } from '../helpers'

type SimpleWalletConnect = { key: string; session: WalletConnect['session'] }

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
  connector: SimpleWalletConnect
  peerMeta: WalletConnectClientMeta
}) {
  return createAction('SET_WC_PEER_META', payload)
}

export function approveWalletConnectSession(payload: {
  walletId: string
  connector: SimpleWalletConnect
  chainId: number
  chain: DApp['chain']
  accounts: string[]
}) {
  return createAction('APPROVE_WC_SESSION', payload)
}

export function rejectWalletConnectSession(payload: {
  walletId: string
  connector: SimpleWalletConnect
}) {
  return createAction('REJECT_WC_SESSION', payload)
}

export function approveWalletConnectSessionv2(payload: DAppv2) {
  return createAction('APPROVE_WC_SESSSION_V2', payload)
}

export function removeWalletConnectSessionv2(payload: { topic: string }) {
  return createAction('REMOVE_WC_SESSSION_V2', payload)
}
