import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { AccountId, ChainId } from 'caip'
import { useWalletsData } from 'features/cryptoWallet'
import { VeridaWalletAccount } from 'types'

import { BlockchainWalletWithAccounts } from 'api/types'

import { ActiveSession } from '../@types'

export function getMaybeVeridaWalletAccountForWalletConnectActiveSession({
  activeSession,
  request,
  walletsData,
}: {
  readonly activeSession: ActiveSession | null | undefined
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly walletsData: ReturnType<typeof useWalletsData>
}): VeridaWalletAccount | undefined {
  if (!activeSession) return undefined

  const requiredCaip = new ChainId(request.params.chainId)

  const accounts: readonly string[] = Object.values(
    activeSession.namespaces
  ).flatMap(({ accounts: accountsWithinCaipNamespace }) =>
    // HACK: WalletConnect may provide multiple accounts for the namespace -
    //       for example, an account for Ethereum Goerli and MultiverseX.
    //       Here, we ensure to only find a matching wallet instance which
    //       corresponds to the requested chain.
    accountsWithinCaipNamespace.filter(
      (accountWithinCaipNamespace) =>
        requiredCaip.toString() ===
        new AccountId(accountWithinCaipNamespace).chainId.toString()
    )
  )

  const [maybeMatchingCaip, ...maybeOtherAccounts] = accounts

  // HACK: This data model theoritically allows multiple accounts for the same activeSession.
  //       We need a way to find which specific account is being referred to, and for now just
  //       make the assumption there is only one.
  if (maybeOtherAccounts.length)
    throw new Error(`Unable to determine which account is being selected.`)

  const { address, chainId: target } = new AccountId(maybeMatchingCaip)

  // HACK: Enforce that wallet connect should provide us with a full qualified
  //       address.
  if (typeof address !== 'string' || !address.length)
    throw new Error(
      `Expected qualified address, encountered "${String(address)}".`
    )

  const possibleVeridaWalletAccounts = Object.values(walletsData).flatMap(
    (
      maybeMatchingVeridaWalletWallet: BlockchainWalletWithAccounts
    ): BlockchainWalletWithAccounts[] => {
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
