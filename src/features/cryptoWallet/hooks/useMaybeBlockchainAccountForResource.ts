import * as React from 'react'

import { BlockchainWalletWithAccounts } from 'api/types'

import { veridaAccountMaybeToMinifiedVeridaAccount } from '../utils'
import { useMaybeFromAddressForResource } from './useMaybeFromAddressForResource'
import { useSelectedMinifiedVeridaAccounts } from './useSelectedMinifiedVeridaAccounts'
import { useWalletsData } from './useWalletsData'

export function useMaybeBlockchainAccountForResource(
  params: Parameters<typeof useMaybeFromAddressForResource>[0]
): BlockchainWalletWithAccounts | null {
  const maybeFromAddress = useMaybeFromAddressForResource(params)

  const walletsData = useWalletsData()

  const selectedMinifiedVeridaAccounts = useSelectedMinifiedVeridaAccounts()

  return React.useMemo<BlockchainWalletWithAccounts | null>(() => {
    if (!maybeFromAddress) return null

    const { namespace, fromAddress } = maybeFromAddress

    const maybeMinifiedVeridaAccount = selectedMinifiedVeridaAccounts.find(
      (e) => e.namespace === namespace && e.address === fromAddress
    )

    if (!maybeMinifiedVeridaAccount) return null

    const maybeMatchingAccount = Object.values(walletsData).find(
      (e: BlockchainWalletWithAccounts) =>
        Object.values(e.accounts).find(
          (f) =>
            // TODO: this is slow and inefficient, fix
            JSON.stringify(veridaAccountMaybeToMinifiedVeridaAccount(f)) ===
            JSON.stringify(maybeMinifiedVeridaAccount)
        )
    )

    return maybeMatchingAccount || null
  }, [maybeFromAddress, selectedMinifiedVeridaAccounts, walletsData])
}
