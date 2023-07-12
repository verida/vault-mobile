import {
  addressAgnosticIsCaipEqual,
  ChainMetadatas,
  getMaybeChainMetadatas,
  getSupportedCaipProtocolFriendlyName,
  isSupportedCaipStandard,
  maybeParseCaip,
  ParsedCaipType,
  useChainMetadatas,
} from 'features/caip'
import * as React from 'react'
import { VeridaWalletAccount, VeridaWalletAccounts } from 'types'

import { Option } from 'components/Select'

import { isWatchedWallet } from '../utils'

export const veridaWalletAccountsToDropdownOptions = ({
  chainMetadatas,
  maybeVeridaWalletAccounts,
  onlyMatchingCaipTypes,
  includesWatchedWallets,
}: {
  readonly chainMetadatas: ChainMetadatas
  readonly maybeVeridaWalletAccounts: VeridaWalletAccounts | undefined
  readonly includesWatchedWallets: boolean
  readonly onlyMatchingCaipTypes: readonly ParsedCaipType[] | null
}): readonly Option[] => {
  if (!maybeVeridaWalletAccounts) return []

  return Object.entries(maybeVeridaWalletAccounts).flatMap(
    ([key, veridaWalletAccount]: [
      string,
      VeridaWalletAccount
    ]): readonly Option[] => {
      const maybeParsedCaip = maybeParseCaip(key)

      if (!maybeParsedCaip) return []

      const isMatchingCaipType = Boolean(
        (onlyMatchingCaipTypes || []).find((maybeMatchingCaipType) =>
          addressAgnosticIsCaipEqual(maybeMatchingCaipType, maybeParsedCaip)
        )
      )

      // If an array of ParsedCaipTypes has been provided, we should filter out the
      // results to contain only caips that are supported.
      if (Array.isArray(onlyMatchingCaipTypes) && !isMatchingCaipType) return []

      const blockchain = maybeParsedCaip?.standard

      if (!isSupportedCaipStandard(blockchain)) return []

      const disabled =
        !includesWatchedWallets && isWatchedWallet(veridaWalletAccount)

      const option: Option = {
        label: veridaWalletAccount.address,
        value: veridaWalletAccount.address,
        disabled,
        flag: getSupportedCaipProtocolFriendlyName(
          chainMetadatas,
          maybeParsedCaip
        ),
      }

      return [option]
    }
  )
}

export function useVeridaWalletAccountDropdownOptions({
  includesWatchedWallets,
  maybeVeridaWalletAccounts,
  onlyMatchingCaipTypes = null,
}: {
  readonly includesWatchedWallets: boolean
  readonly maybeVeridaWalletAccounts: VeridaWalletAccounts | undefined
  readonly onlyMatchingCaipTypes?: readonly ParsedCaipType[] | null
}) {
  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  return React.useMemo<readonly Option[]>(
    () =>
      veridaWalletAccountsToDropdownOptions({
        chainMetadatas,
        includesWatchedWallets,
        maybeVeridaWalletAccounts,
        onlyMatchingCaipTypes,
      }),
    [
      chainMetadatas,
      maybeVeridaWalletAccounts,
      includesWatchedWallets,
      onlyMatchingCaipTypes,
    ]
  )
}
