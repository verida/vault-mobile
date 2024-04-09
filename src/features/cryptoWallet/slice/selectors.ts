import { AssetType } from 'caip'

import { BlockchainNetwork } from '~/features/blockchain'
import { RootState } from '~/reduxStore/types'

import { getBalancesData } from '../api'
import {
  SelectSingleTokenData,
  SelectSingleTokenDataFailureCase,
} from '../types'
import { getUniqueWalletAddresses } from '../utils'

// == Wallet selectors =========================================================

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
  return wallets?.find((wallet) => wallet._id === selectedWalletId) || null
}

export const getCryptoWalletStatus = (state: RootState) => {
  return state.cryptoWallets.status
}

// === Token selectors =========================================================

export const selectNativeTokenBalance = (
  state: RootState,
  token: BlockchainNetwork
) => {
  const selectedWallet = getSelectedCryptoWallet(state)
  const addresses = getUniqueWalletAddresses(selectedWallet)
  const { list: balances } = getBalancesData(state, addresses)

  if (balances && balances.some((item) => item.symbol === token.symbol)) {
    return balances.find((item) => item.symbol === token.symbol)?.balance ?? 0
  } else {
    0
  }
}

const createDefaultErrorResponse = (): SelectSingleTokenDataFailureCase => ({
  label: '',
  price: 0,
  change: 0,
  quantity: 0,
  amount: 0,
})

// TODO: @cawfree If there was a `tokenType` field, it should be created here.
export const selectSingleTokenData = (
  state: RootState,
  asset: AssetType | undefined
): SelectSingleTokenData => {
  if (!asset) return createDefaultErrorResponse()

  const selectedWallet = getSelectedCryptoWallet(state)
  const addresses = getUniqueWalletAddresses(selectedWallet)
  const { list } = getBalancesData(state, addresses)

  const tokenBalance = list?.find((item) => {
    return (
      new AssetType(item.asset).toString() === new AssetType(asset).toString()
    )
  })

  // We should always find a token balance, so this shouldn't happen
  // but just in case, return 0 values if not found
  if (!tokenBalance) return createDefaultErrorResponse()

  return {
    ...tokenBalance,
    label: tokenBalance.symbol,
    price: tokenBalance.quote.USD.price,
    change: tokenBalance.quote.USD.percent_change_24h,
    quantity: tokenBalance.balance,
    amount: tokenBalance.amount,
  }
}
