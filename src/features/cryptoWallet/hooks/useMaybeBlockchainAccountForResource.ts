import * as React from 'react'

import { LegacyCryptoWallet } from '~/features/cryptoWallet'

import { transformLegacyWalletAccountToCryptoWalletAccount } from '../utils'
import { useCryptoWallets } from './useCryptoWallets'
import { useMaybeFromAddressForResource } from './useMaybeFromAddressForResource'
import { useSelectedMinifiedBlockchainAccounts } from './useSelectedMinifiedBlockchainAccounts'

export function useMaybeBlockchainAccountForResource(
  params: Parameters<typeof useMaybeFromAddressForResource>[0]
): LegacyCryptoWallet | null {
  const maybeFromAddress = useMaybeFromAddressForResource(params)

  const wallets = useCryptoWallets()

  const selectedMinifiedBlockchainAccounts =
    useSelectedMinifiedBlockchainAccounts()

  return React.useMemo<LegacyCryptoWallet | null>(() => {
    if (!maybeFromAddress) return null

    const { namespace, fromAddress } = maybeFromAddress

    const maybeMinifiedVeridaAccount = selectedMinifiedBlockchainAccounts.find(
      (e) => e.namespace === namespace && e.address === fromAddress
    )

    if (!maybeMinifiedVeridaAccount) return null

    const maybeMatchingAccount = Object.values(wallets).find(
      (e: LegacyCryptoWallet) =>
        Object.values(e.accounts).find(
          (f) =>
            // TODO: this is slow and inefficient, fix
            JSON.stringify(
              transformLegacyWalletAccountToCryptoWalletAccount(f)
            ) === JSON.stringify(maybeMinifiedVeridaAccount)
        )
    )

    return maybeMatchingAccount || null
  }, [maybeFromAddress, selectedMinifiedBlockchainAccounts, wallets])
}
