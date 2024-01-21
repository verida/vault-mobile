import { isSupportedCaipNamespace } from 'features/caip'
import {
  MinifiedBlockchainAccount,
  MinifiedBlockchainAccounts,
  VeridaWalletAccountOption,
} from 'features/cryptoWallet/@types'
import * as React from 'react'

import {
  getLabelForMinifiedBlockchainAccount,
  getMinifiedBlockchainAccountId,
} from './useSelectedMinifiedBlockchainAccounts'

export const minifiedBlockchainAccountsToDropdownOptions = ({
  selectedMinifiedBlockchainAccounts,
  onlyMatchingNamespaces,
}: {
  readonly selectedMinifiedBlockchainAccounts: MinifiedBlockchainAccounts
  readonly onlyMatchingNamespaces: readonly string[] | null
}): readonly VeridaWalletAccountOption[] => {
  return selectedMinifiedBlockchainAccounts.flatMap(
    (
      minifiedBlockchainAccount: MinifiedBlockchainAccount
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
        label: getLabelForMinifiedBlockchainAccount(minifiedBlockchainAccount),
        value: getMinifiedBlockchainAccountId(minifiedBlockchainAccount),
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
  readonly selectedMinifiedBlockchainAccounts: MinifiedBlockchainAccounts
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
