import { NearAccountPointer, NearTransaction } from '../types'

export function nearMaybeAccountForTransactionSignatory({
  nearAccountPointers,
  transaction: { signerId },
}: {
  readonly nearAccountPointers: readonly NearAccountPointer[]
  readonly transaction: NearTransaction
}): NearAccountPointer | undefined {
  return nearAccountPointers.find(({ signerId: sid }) => signerId === sid)
}
