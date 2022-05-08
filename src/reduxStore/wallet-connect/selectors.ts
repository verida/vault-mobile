import { RootState } from '../types'

const s = (state: RootState) => state.walletConnect

export const dappsSelector = (state: RootState) => s(state).dapps

export const walletConnectRequestSelector = (state: RootState) =>
  s(state).requests
