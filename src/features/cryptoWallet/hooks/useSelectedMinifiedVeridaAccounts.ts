import { ChainId } from 'caip'
import { ethers } from 'ethers'
import { isSupportedCaipNamespace, SupportedCaipNamespace } from 'features/caip'
import * as React from 'react'

import { BlockchainAccount } from 'api/types'

import {
  MinifiedVeridaAccount,
  MinifiedVeridaAccountEip155,
  MinifiedVeridaAccountNear,
  MinifiedVeridaAccounts,
} from '../@types'
import { useMaybeSelectedWallet } from './useMaybeSelectedWallet'

const veridaAccountToMinifiedVeridaAccountEip155 = (
  blockchainAccount: BlockchainAccount
): MinifiedVeridaAccountEip155 => {
  const { address, privateKey } = blockchainAccount

  if (typeof address !== 'string' || !ethers.utils.isAddress(address))
    throw new Error(`Expected Ethereum address, encountered "${address}".`)

  if (typeof privateKey !== 'string' || !privateKey.length)
    throw new Error('Expected non-empty string privateKey.')

  return {
    namespace: SupportedCaipNamespace.EIP_155,
    address,
    privateKey,
  }
}

const veridaAccountToMinifiedVeridaAccountNear = ({
  address: signerId,
  privateKey,
}: BlockchainAccount): MinifiedVeridaAccountNear => {
  if (typeof signerId !== 'string' || !signerId.length)
    throw new Error(
      `Expected non-empty string signerId, encountered "${String(signerId)}".`
    )

  if (typeof privateKey !== 'string' || !privateKey.length)
    throw new Error('Expected non-empty string privateKey.')

  return {
    namespace: SupportedCaipNamespace.NEAR,
    privateKey,
    address: signerId,
  }
}

const veridaAccountMaybeToMinifiedVeridaAccount = (
  blockchainAccount: BlockchainAccount
): MinifiedVeridaAccount | undefined => {
  const { chainId } = blockchainAccount

  if (typeof chainId !== 'string' || !chainId.length)
    throw new Error(
      `Expected non-empty string chainId, encountered "${chainId}".`
    )

  const { namespace } = new ChainId(chainId)

  if (namespace === SupportedCaipNamespace.EIP_155) {
    return veridaAccountToMinifiedVeridaAccountEip155(blockchainAccount)
  } else if (namespace === SupportedCaipNamespace.NEAR) {
    return veridaAccountToMinifiedVeridaAccountNear(blockchainAccount)
  }

  __DEV__ &&
    // eslint-disable-next-line no-console
    console.warn(
      `[veridaAccountMaybeToMinifiedVeridaAccount]: Encountered unimplemented namespace, "${namespace}". (Supported?: ${isSupportedCaipNamespace(
        namespace
      )})`
    )
  return undefined
}

export const getMinifiedVeridaAccountId = (
  minifiedVeridaAccount: MinifiedVeridaAccount
): string =>
  ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(JSON.stringify(minifiedVeridaAccount))
  )

export const getLabelForMinifiedVeridaAccount = (
  minifiedVeridaAccount: MinifiedVeridaAccount
) => {
  const { address } = minifiedVeridaAccount
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
export function useSelectedMinifiedVeridaAccounts(): MinifiedVeridaAccounts {
  const maybeVeridaWalletAccounts = useMaybeSelectedWallet()?.accounts

  return React.useMemo<readonly MinifiedVeridaAccount[]>(() => {
    // First, minify the accounts so they just consist of raw signing information,
    // and have no presumptions about a specific chain.
    const minifiedAccounts = Object.entries(maybeVeridaWalletAccounts || {})
      .map(([, blockchainAccount]) =>
        veridaAccountMaybeToMinifiedVeridaAccount(blockchainAccount)
      )
      .flatMap((maybeMinifiedAccount) =>
        maybeMinifiedAccount ? [maybeMinifiedAccount] : []
      )

    // Invariably, this list contains duplicates. Dedup.
    // TODO: This is slow.
    // TODO: This is unsafe!
    const hashes = minifiedAccounts.map(getMinifiedVeridaAccountId)

    // If we encounter a duplicate, the `indexOf` for position `i` will not be identical.
    return minifiedAccounts.filter((_, i) => hashes.indexOf(hashes[i]) === i)
  }, [maybeVeridaWalletAccounts])
}
