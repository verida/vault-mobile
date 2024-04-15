import { RootState } from '~/reduxStore/types'

// In components, prefer using a hook over a selector as the selector needs to be used in a `useAppSelector` anyway.

export const getCryptoWallets = (state: RootState) => {
  return state.cryptoWallets.wallets
}

export const getCryptoWalletsCount = (state: RootState) => {
  const wallets = getCryptoWallets(state)
  return wallets.length || 0
}

export const getSelectedCryptoWalletId = (state: RootState) => {
  return state.cryptoWallets.selectedWalletId
}

export const getSelectedCryptoWallet = (state: RootState) => {
  const selectedWalletId = getSelectedCryptoWalletId(state)
  if (selectedWalletId === null) {
    return null
  }
  const wallets = getCryptoWallets(state)
  return wallets?.find((wallet) => wallet.id === selectedWalletId) || null
}

export const getCryptoWalletStatus = (state: RootState) => {
  return state.cryptoWallets.status
}
