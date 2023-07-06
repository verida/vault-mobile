import { getSelectedWalletId } from 'features/wallets'

import { RootState } from '../types'

const s = (state: RootState) => state.walletConnect

const dappsBySelectedWallet = (state: RootState) => {
  const selectedWalletId = getSelectedWalletId(state)
  const allDapps = s(state).dapps || []
  return allDapps.filter((app) => app.walletId === selectedWalletId)
}

export const dappsSelector = (state: RootState) => dappsBySelectedWallet(state)

const dappsBySelectedWalletv2 = (state: RootState) => {
  const selectedWalletId = getSelectedWalletId(state)
  const allDappsv2 = s(state).dappsv2 || []
  return allDappsv2.filter((app) => app.walletId === selectedWalletId)
}

export const dappsSelectorv2 = (state: RootState) => {
  return dappsBySelectedWalletv2(state)
}
