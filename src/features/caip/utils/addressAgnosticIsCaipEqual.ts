import { ParsedCaipType, stringifyCaip } from 'features/caip'

export function addressAgnosticIsCaipEqual(
  a: ParsedCaipType,
  b: ParsedCaipType
) {
  return stringifyCaip(a, false) === stringifyCaip(b, false)
}
