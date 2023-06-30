import { EnvironmentType } from '@verida/types'
import { getCaipWalletTypeFriendlyName, isCaipWalletType } from 'features/caip'
import { isWatchedWallet } from 'features/wallet'
import * as React from 'react'
import { VeridaWalletAccount, VeridaWalletAccounts } from 'types'

import { Option } from 'components/Select'
import CONFIG from 'config/environment'

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
      // TODO: we are doing this a lot, use a common method
      const [chain] = key.split(':')

      if (!isCaipWalletType(chain)) return []

      const disabled =
        !includesWatchedWallets && isWatchedWallet(veridaWalletAccount)

      const option: Option = {
        label: veridaWalletAccount.address,
        value: veridaWalletAccount.address,
        disabled,
        flag: getCaipWalletTypeFriendlyName(chain, environmentType),
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
