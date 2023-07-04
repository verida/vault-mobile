import { EnvironmentType } from '@verida/types'
import {
  getSupportedCaipProtocolFriendlyName,
  isSupportedCaipProtocol,
  maybeParseCaip,
} from 'features/caip'
import * as React from 'react'
import { VeridaWalletAccount, VeridaWalletAccounts } from 'types'

import { Option } from 'components/Select'
import CONFIG from 'config/environment'

import { isWatchedWallet } from '../utils'

const veridaWalletAccountsToDropdownOptions = ({
  maybeVeridaWalletAccounts,
  includesWatchedWallets,
  environmentType = CONFIG.VERIDA_ENVIRONMENT,
}: {
  readonly maybeVeridaWalletAccounts: VeridaWalletAccounts | undefined
  readonly includesWatchedWallets: boolean
  readonly environmentType?: EnvironmentType
}): readonly Option[] => {
  if (!maybeVeridaWalletAccounts) return []

  return Object.entries(maybeVeridaWalletAccounts).flatMap(
    ([key, veridaWalletAccount]: [
      string,
      VeridaWalletAccount
    ]): readonly Option[] => {
      const maybeParsedCaip = maybeParseCaip(key)

      const blockchain = maybeParsedCaip?.protocol

      if (!isSupportedCaipProtocol(blockchain)) return []

      const disabled =
        !includesWatchedWallets && isWatchedWallet(veridaWalletAccount)

      const option: Option = {
        label: veridaWalletAccount.address,
        value: veridaWalletAccount.address,
        disabled,
        flag: getSupportedCaipProtocolFriendlyName(blockchain, environmentType),
      }

      return [option]
    }
  )
}

export function useVeridaWalletAccountDropdownOptions({
  includesWatchedWallets,
  maybeVeridaWalletAccounts,
}: {
  readonly includesWatchedWallets: boolean
  readonly maybeVeridaWalletAccounts: VeridaWalletAccounts | undefined
}) {
  return React.useMemo<readonly Option[]>(
    () =>
      veridaWalletAccountsToDropdownOptions({
        includesWatchedWallets,
        maybeVeridaWalletAccounts,
      }),
    [maybeVeridaWalletAccounts, includesWatchedWallets]
  )
}
