import { WALLET_TYPE_DEFINITIONS } from '../constants'
import { LegacyCryptoWallet, WalletType } from '../types'

export const getUniqueWalletAddresses = (wallet: LegacyCryptoWallet | null) => {
  if (!wallet || !wallet.accounts || wallet.accounts.length === 0) {
    return []
  }

  const addresses: string[] = [
    ...new Set(
      wallet.accounts.flatMap((account) => {
        // Ensure a valid chainId.
        if (typeof account.chainId !== 'string' || !account.chainId.length)
          return []

        return [`${account.chainId}:${account.address}`]
      })
    ),
  ]

  return addresses
}

export function getWalletTypeShortLabel(walletType: WalletType) {
  return WALLET_TYPE_DEFINITIONS[walletType].shortLabel
}

export function getWalletTypeLongLabel(walletType: WalletType) {
  return WALLET_TYPE_DEFINITIONS[walletType].longLabel
}
