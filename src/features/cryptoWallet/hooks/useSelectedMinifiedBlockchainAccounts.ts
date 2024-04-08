import { ethers } from 'ethers'
import * as React from 'react'

import { CryptoWalletAccount, CryptoWalletAccounts } from '../types'
import { transformLegacyWalletAccountToCryptoWalletAccount } from '../utils'
import { useSelectedWallet } from './useSelectedWallet'

// TODO: Move to utils
export const getCryptoWalletAccountId = (
  cryptoWalletAccount: CryptoWalletAccount
): string =>
  ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(JSON.stringify(cryptoWalletAccount))
  )

// TODO: Move to utils
export const getCryptoWalletAccountAddress = (
  cryptoWalletAccount: CryptoWalletAccount
) => {
  const { address } = cryptoWalletAccount
  return address
}

// TODO: This won't be necessary once it has been refactored
// The persistence model saves multiple copies of the same private key
// for different chains, i.e. a duplicate mnemonic for both a mainnet and
// testnet. When a new compatible chain is referenced, since we don't
// have a dedicated private key clone for it, the chain is deemed
// unsupported **even though there are potentially compatible keys inside
// storage**. To resolve this, we load all account data, dedup and separate by
// namespace - this allows us to represent each private key uniquely,
// and greatly increase the exposure - without actually having to migrate
// the existing persistence model.
export function useSelectedMinifiedBlockchainAccounts(): CryptoWalletAccounts {
  const maybeVeridaWalletAccounts = useSelectedWallet()?.accounts

  return React.useMemo<CryptoWalletAccounts>(() => {
    // First, minify the accounts so they just consist of raw signing information,
    // and have no presumptions about a specific chain.
    const cryptoWalletAccounts = Object.entries(maybeVeridaWalletAccounts || {})
      .map(([, blockchainAccount]) =>
        transformLegacyWalletAccountToCryptoWalletAccount(blockchainAccount)
      )
      .flatMap((maybeMinifiedAccount) =>
        maybeMinifiedAccount ? [maybeMinifiedAccount] : []
      )

    // Invariably, this list contains duplicates. Dedup.
    // TODO: This is slow.
    // TODO: This is unsafe!
    const hashes = cryptoWalletAccounts.map(getCryptoWalletAccountId)

    // If we encounter a duplicate, the `indexOf` for position `i` will not be identical.
    return cryptoWalletAccounts.filter(
      (_, i) => hashes.indexOf(hashes[i]) === i
    )
  }, [maybeVeridaWalletAccounts])
}
