import { parseCaipOrThrow, stringifyCaip } from 'features/caip'
import { useWalletsData } from 'hooks'
import { VeridaWallet, VeridaWalletAccount } from 'types'

import { ActiveSession } from '../@types'

export function getMaybeVeridaWalletAccountForWalletConnectActiveSession({
  activeSession,
  walletsData,
}: {
  readonly activeSession: ActiveSession | null | undefined
  readonly walletsData: ReturnType<typeof useWalletsData>
}): VeridaWalletAccount | undefined {
  if (!activeSession) return undefined

  const accounts: readonly string[] = Object.values(
    activeSession.namespaces
  ).flatMap(
    ({ accounts: accountsWithinCaipNamespace }) => accountsWithinCaipNamespace
  )

  const [maybeMatchingCaip, ...maybeOtherAccounts] = accounts

  // HACK: This data model theoritically allows multiple accounts for the same activeSession.
  //       We need a way to find which specific account is being referred to, and for now just
  //       make the assumption there is only one.
  if (maybeOtherAccounts.length)
    throw new Error(`Unable to determine which account is being selected.`)

  const parsedCaipType = parseCaipOrThrow(maybeMatchingCaip)

  // HACK: Enforce that wallet connect should provide us with a full qualified
  //       address.
  const { address } = parsedCaipType

  if (typeof address !== 'string' || !address.length)
    throw new Error(
      `Expected qualified address, encountered "${String(address)}".`
    )

  // What address-agnostic caip identifier is being targeted?
  const target = stringifyCaip({
    parsedCaipType,
    suppressAddressComponent: true,
  })

  const possibleVeridaWalletAccounts = Object.values(walletsData).flatMap(
    (maybeMatchingVeridaWalletWallet: VeridaWallet): VeridaWalletAccount[] => {
      const maybeAccounts = maybeMatchingVeridaWalletWallet?.accounts

      if (!maybeAccounts) return []

      // @ts-expect-error over-generalization
      const { [target]: maybeMatchingAccount } = maybeAccounts

      return maybeMatchingAccount ? [maybeMatchingAccount] : []
    }
  )

  const maybeMatchingVeridaWalletAccounts = possibleVeridaWalletAccounts.filter(
    (possibleVeridaWalletAccount: VeridaWalletAccount) =>
      possibleVeridaWalletAccount?.address === address
  )

  const [maybeMatchingVeridaWalletAccount, ...maybeOtherMatches] =
    maybeMatchingVeridaWalletAccounts

  if (maybeOtherMatches.length)
    throw new Error(
      `Was unable to unambiguously resolve correct wallet for request.`
    )

  if (!maybeMatchingVeridaWalletAccount)
    throw new Error(`Unable to find VeridaWalletAccount for "${target}".`)

  return maybeMatchingVeridaWalletAccount
}
