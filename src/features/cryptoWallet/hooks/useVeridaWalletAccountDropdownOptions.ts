import { isSupportedCaipNamespace } from 'features/caip'
import {
  MinifiedVeridaAccount,
  MinifiedVeridaAccounts,
  VeridaWalletAccountOption,
} from 'features/cryptoWallet/@types'
import * as React from 'react'

import {
  getLabelForMinifiedVeridaAccount,
  getMinifiedVeridaAccountId,
} from './useSelectedMinifiedVeridaAccounts'

export const veridaWalletAccountsToDropdownOptions = ({
  selectedMinifiedVeridaAccounts,
  onlyMatchingNamespaces,
}: {
  readonly selectedMinifiedVeridaAccounts: MinifiedVeridaAccounts
  readonly onlyMatchingNamespaces: readonly string[] | null
}): readonly VeridaWalletAccountOption[] => {
  return selectedMinifiedVeridaAccounts.flatMap(
    (
      minifiedVeridaAccount: MinifiedVeridaAccount
    ): readonly VeridaWalletAccountOption[] => {
      const { namespace } = minifiedVeridaAccount

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
        label: getLabelForMinifiedVeridaAccount(minifiedVeridaAccount),
        value: getMinifiedVeridaAccountId(minifiedVeridaAccount),
        disabled: false,
      }

      return [option]
    }
  )
}

export function useVeridaWalletAccountDropdownOptions({
  selectedMinifiedVeridaAccounts,
  onlyMatchingNamespaces = null,
}: {
  readonly selectedMinifiedVeridaAccounts: MinifiedVeridaAccounts
  readonly onlyMatchingNamespaces?: readonly string[] | null
}) {
  return React.useMemo<readonly VeridaWalletAccountOption[]>(
    () =>
      veridaWalletAccountsToDropdownOptions({
        selectedMinifiedVeridaAccounts,
        onlyMatchingNamespaces,
      }),
    [selectedMinifiedVeridaAccounts, onlyMatchingNamespaces]
  )
}
