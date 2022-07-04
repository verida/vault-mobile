import { SUPPORTED_CHAINS } from '../../wallet-connect/constants'
import { RootState } from '../types'

const s = (state: RootState) => state.walletConnect

export const dappsSelector = (state: RootState) => s(state).dapps

export const walletConnectRequestSelector = (state: RootState) =>
  s(state).requests

export const walletConnectNetworkSelector = (state: RootState) =>
  s(state).network || SUPPORTED_CHAINS[0]
