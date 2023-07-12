import { ChainId } from 'caip'
import {
  ChainMetadatas,
  getMaybeChainMetadatas,
  getSupportedCaipProtocolFriendlyName,
  isSupportedCaipNamespace,
  useChainMetadatas,
} from 'features/caip'
import * as React from 'react'
import { VeridaWalletAccount, VeridaWalletAccounts } from 'types'

import { Option } from 'components/Select'

import { isWatchedWallet } from '../utils'

export const veridaWalletAccountsToDropdownOptions = ({
  chainMetadatas,
  maybeVeridaWalletAccounts,
  onlyMatchingCaipChainIds,
  includesWatchedWallets,
}: {
  readonly chainMetadatas: ChainMetadatas
  readonly maybeVeridaWalletAccounts: VeridaWalletAccounts | undefined
  readonly includesWatchedWallets: boolean
  readonly onlyMatchingCaipChainIds: readonly ChainId[] | null
}): readonly Option[] => {
  if (!maybeVeridaWalletAccounts) return []

  return Object.entries(maybeVeridaWalletAccounts).flatMap(
    ([key, veridaWalletAccount]: [
      string,
      VeridaWalletAccount
    ]): readonly Option[] => {
      const caipChainId = new ChainId(key)

      const isMatchingCaipType = Boolean(
        (onlyMatchingCaipChainIds || []).find(
          (maybeMatchingCaipType) =>
            caipChainId.toString() === maybeMatchingCaipType.toString()
        )
      )

      // If an array of ParsedCaipTypes has been provided, we should filter out the
      // results to contain only caips that are supported.
      if (Array.isArray(onlyMatchingCaipChainIds) && !isMatchingCaipType)
        return []

      const blockchain = caipChainId?.namespace

      if (!isSupportedCaipNamespace(blockchain)) return []

      const disabled =
        !includesWatchedWallets && isWatchedWallet(veridaWalletAccount)

      const option: Option = {
        label: veridaWalletAccount.address,
        value: veridaWalletAccount.address,
        disabled,
        flag: getSupportedCaipProtocolFriendlyName(chainMetadatas, caipChainId),
      }

      return [option]
    }
  )
}

export function useVeridaWalletAccountDropdownOptions({
  includesWatchedWallets,
  maybeVeridaWalletAccounts,
  onlyMatchingCaipChainIds = null,
}: {
  readonly includesWatchedWallets: boolean
  readonly maybeVeridaWalletAccounts: VeridaWalletAccounts | undefined
  readonly onlyMatchingCaipChainIds?: readonly ChainId[] | null
}) {
  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  return React.useMemo<readonly Option[]>(
    () =>
      veridaWalletAccountsToDropdownOptions({
        chainMetadatas,
        includesWatchedWallets,
        maybeVeridaWalletAccounts,
        onlyMatchingCaipChainIds,
      }),
    [
      chainMetadatas,
      maybeVeridaWalletAccounts,
      includesWatchedWallets,
      onlyMatchingCaipChainIds,
    ]
  )
}
