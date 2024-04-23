import * as React from 'react'

import { isSupportedCaipNamespace } from '~/features/caip'

import {
  CryptoWalletAccount,
  CryptoWalletAccounts,
  VeridaWalletAccountOption,
} from '../types'
import {
  getCryptoWalletAccountAddress,
  getCryptoWalletAccountId,
} from './useSelectedMinifiedBlockchainAccounts'

export const minifiedBlockchainAccountsToDropdownOptions = ({
  selectedMinifiedBlockchainAccounts,
  onlyMatchingNamespaces,
}: {
  readonly selectedMinifiedBlockchainAccounts: CryptoWalletAccounts
  readonly onlyMatchingNamespaces: readonly string[] | null
}): readonly VeridaWalletAccountOption[] => {
  return selectedMinifiedBlockchainAccounts.flatMap(
    (
      minifiedBlockchainAccount: CryptoWalletAccount
    ): readonly VeridaWalletAccountOption[] => {
      const { namespace } = minifiedBlockchainAccount

      // Just to be sure. Note it is possible that there are some legacy
      // unsupported private keys in local storage that we wouldn't want
      // to outright remove.
      if (!isSupportedCaipNamespace(namespace)) return []

      const isMatchingNamespace = (onlyMatchingNamespaces || []).includes(
        namespace
      )

      // If an array of ParsedCaipTypes has been provided, we should filter out the
      // results to contain only caips that are supported.
      if (Array.isArray(onlyMatchingNamespaces) && !isMatchingNamespace)
        return []

      const option: VeridaWalletAccountOption = {
        label: getCryptoWalletAccountAddress(minifiedBlockchainAccount),
        value: getCryptoWalletAccountId(minifiedBlockchainAccount),
        disabled: false,
      }

      return [option]
    }
  )
}

export function useVeridaWalletAccountDropdownOptions({
  selectedMinifiedBlockchainAccounts,
  onlyMatchingNamespaces = null,
}: {
  readonly selectedMinifiedBlockchainAccounts: CryptoWalletAccounts
  readonly onlyMatchingNamespaces?: readonly string[] | null
}) {
  return React.useMemo<readonly VeridaWalletAccountOption[]>(
    () =>
      minifiedBlockchainAccountsToDropdownOptions({
        selectedMinifiedBlockchainAccounts,
        onlyMatchingNamespaces,
      }),
    [selectedMinifiedBlockchainAccounts, onlyMatchingNamespaces]
  )
}
