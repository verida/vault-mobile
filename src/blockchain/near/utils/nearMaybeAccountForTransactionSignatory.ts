import { NearAccountPointer, NearTransaction } from '../@types'
import { getNearAccountId } from './getNearAccountId'

export function nearMaybeAccountForTransactionSignatory({
  nearAccountPointers,
  transaction: { signerId },
}: {
  readonly nearAccountPointers: readonly NearAccountPointer[]
  readonly transaction: NearTransaction
}): NearAccountPointer | undefined {
  return nearAccountPointers.find(
    ({ accountId }) => accountId === getNearAccountId({ signerId })
  )
}
