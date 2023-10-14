//import { ChainId } from 'caip'
import {
  //ChainMetadatas,
  //getSupportedCaipProtocolFriendlyName,
  isSupportedCaipNamespace,
} from 'features/caip'
import {
  MinifiedVeridaAccount,
  MinifiedVeridaAccounts,
  VeridaWalletAccountOption,
} from 'features/cryptoWallet/@types'
import * as React from 'react'

//import { BlockchainAccount } from 'api/types'
//import { isWatchedWallet } from '../utils'
import {
  getLabelForMinifiedVeridaAccount,
  getMinifiedVeridaAccountId,
} from './useSelectedMinifiedVeridaAccounts'

export const veridaWalletAccountsToDropdownOptions = ({
  //chainMetadatas,
  selectedMinifiedVeridaAccounts,
  onlyMatchingNamespaces,
}: //includesWatchedWallets,
{
  //readonly chainMetadatas: ChainMetadatas
  readonly selectedMinifiedVeridaAccounts: MinifiedVeridaAccounts
  //readonly includesWatchedWallets: boolean
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

      //const disabled =
      //  !includesWatchedWallets && isWatchedWallet(veridaWalletAccount)

      const option: VeridaWalletAccountOption = {
        //caipChainId,
        label: getLabelForMinifiedVeridaAccount(minifiedVeridaAccount),
        value: getMinifiedVeridaAccountId(minifiedVeridaAccount),
        disabled: false,
        //flag: getSupportedCaipProtocolFriendlyName(chainMetadatas, caipChainId),
      }

      return [option]
    }
  )
}

export function useVeridaWalletAccountDropdownOptions({
  //includesWatchedWallets,
  selectedMinifiedVeridaAccounts,
  onlyMatchingNamespaces = null,
}: {
  //readonly includesWatchedWallets: boolean
  readonly selectedMinifiedVeridaAccounts: MinifiedVeridaAccounts
  readonly onlyMatchingNamespaces?: readonly string[] | null
}) {
  //const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  return React.useMemo<readonly VeridaWalletAccountOption[]>(
    () =>
      veridaWalletAccountsToDropdownOptions({
        //chainMetadatas,
        //includesWatchedWallets,
        selectedMinifiedVeridaAccounts,
        onlyMatchingNamespaces,
      }),
    [
      //chainMetadatas,
      selectedMinifiedVeridaAccounts,
      //includesWatchedWallets,
      onlyMatchingNamespaces,
    ]
  )
}
