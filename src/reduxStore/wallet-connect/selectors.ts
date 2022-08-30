import { SUPPORTED_CHAINS } from '../../wallet-connect/constants'
import { RootState } from '../types'

const s = (state: RootState) => state.walletConnect

const dappsBySelectedWallet = (state: RootState) => {
  const selectedWalletId = (state.main as any).selectedWallet as string // TODO: cleanup, convert main reducer to typescript
  const allDapps = s(state).dapps || []
  return allDapps.filter((app) => app.walletId === selectedWalletId)
}

export const dappsSelector = (state: RootState) => dappsBySelectedWallet(state)

export const dappsWC2Selector = (state: RootState) =>
  dappsBySelectedWallet(state)

export const walletConnectRequestSelector = (state: RootState) =>
  s(state).requests

export const walletConnectNetworkSelector = (state: RootState) =>
  s(state).network || SUPPORTED_CHAINS[0]
