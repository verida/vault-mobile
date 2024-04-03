import { ethers } from 'ethers'
import * as React from 'react'

import { MinifiedBlockchainAccount, MinifiedBlockchainAccounts } from '../types'
import { veridaAccountMaybeToMinifiedBlockchainAccount } from '../utils'
import { useMaybeSelectedWallet } from './useMaybeSelectedWallet'

export const getMinifiedBlockchainAccountId = (
  minifiedBlockchainAccount: MinifiedBlockchainAccount
): string =>
  ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(JSON.stringify(minifiedBlockchainAccount))
  )

export const getLabelForMinifiedBlockchainAccount = (
  minifiedBlockchainAccount: MinifiedBlockchainAccount
) => {
  const { address } = minifiedBlockchainAccount
  return address
}

// The persistence model saves multiple copies of the same private key
// for different chains, i.e. a duplicate mnemonic for both a mainnet and
// testnet. When a new compatible chain is referenced, since we don't
// have a dedicated private key clone for it, the chain is deemed
// unsupported **even though there are potentially compatible keys inside
// storage**. To resolve this, we load all account data, dedup and separate by
// namespace - this allows us to represent each private key uniquely,
// and greatly increase the exposure - without actually having to migrate
// the existing persistence model.
export function useSelectedMinifiedBlockchainAccounts(): MinifiedBlockchainAccounts {
  const maybeVeridaWalletAccounts = useMaybeSelectedWallet()?.accounts

  return React.useMemo<readonly MinifiedBlockchainAccount[]>(() => {
    // First, minify the accounts so they just consist of raw signing information,
    // and have no presumptions about a specific chain.
    const minifiedAccounts = Object.entries(maybeVeridaWalletAccounts || {})
      .map(([, blockchainAccount]) =>
        veridaAccountMaybeToMinifiedBlockchainAccount(blockchainAccount)
      )
      .flatMap((maybeMinifiedAccount) =>
        maybeMinifiedAccount ? [maybeMinifiedAccount] : []
      )

    // Invariably, this list contains duplicates. Dedup.
    // TODO: This is slow.
    // TODO: This is unsafe!
    const hashes = minifiedAccounts.map(getMinifiedBlockchainAccountId)

    // If we encounter a duplicate, the `indexOf` for position `i` will not be identical.
    return minifiedAccounts.filter((_, i) => hashes.indexOf(hashes[i]) === i)
  }, [maybeVeridaWalletAccounts])
}
