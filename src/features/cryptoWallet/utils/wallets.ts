import { AccountId } from 'caip'

import { BlockchainNetwork } from '~/features/blockchain'

import { WALLET_TYPE_DEFINITIONS } from '../constants'
import { LegacyCryptoWallet, WalletType } from '../types'

export function getCryptoWalletAccountIds(
  wallet: LegacyCryptoWallet,
  blockchains: BlockchainNetwork[]
): AccountId[] {
  const accountIds: AccountId[] = []

  blockchains.forEach((blockchain) => {
    const account = wallet.accounts.find(
      (item) => item.namespace === blockchain.namespace
    )
    if (account) {
      accountIds.push(
        new AccountId({
          chainId: blockchain.chainId,
          address: account.address,
        })
      )
    }
  })

  return accountIds
}

export function getWalletTypeShortLabel(walletType: WalletType) {
  return WALLET_TYPE_DEFINITIONS[walletType].shortLabel
}

export function getWalletTypeLongLabel(walletType: WalletType) {
  return WALLET_TYPE_DEFINITIONS[walletType].longLabel
}
