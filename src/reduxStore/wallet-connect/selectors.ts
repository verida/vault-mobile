import { RootState } from '../types'

const s = (state: RootState) => state.walletConnect

const dappsBySelectedWallet = (state: RootState) => {
  const selectedWalletId = (state.main as any).selectedWallet as string // TODO: cleanup, convert main reducer to typescript
  const allDapps = s(state).dapps || []
  return allDapps.filter((app) => app.walletId === selectedWalletId)
}

export const dappsSelector = (state: RootState) => dappsBySelectedWallet(state)

const dappsBySelectedWalletv2 = (state: RootState) => {
  const selectedWalletId = (state.main as any).selectedWallet as string // TODO: cleanup, convert main reducer to typescript
  const allDappsv2 = s(state).dappsv2 || []
  return allDappsv2.filter((app) => app.walletId === selectedWalletId)
}

export const dappsSelectorv2 = (state: RootState) => {
  return dappsBySelectedWalletv2(state)
}
