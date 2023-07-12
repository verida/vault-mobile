import { NearAccount, NearAccountPointer } from '../@types'

export function throwIfNearAccountDoesNotMatchNearAccountPointer({
  nearAccount,
  nearAccountPointer,
}: {
  readonly nearAccount: NearAccount
  readonly nearAccountPointer: NearAccountPointer
}) {
  if (
    nearAccount.accountId !== nearAccountPointer.accountId ||
    nearAccount.publicKey !== nearAccountPointer.publicKey
  )
    throw new Error(
      `Specified NearAccountPointer does not resolve to NearAccount.`
    )
}
