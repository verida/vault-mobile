import { ParsedCaipType, stringifyCaip } from 'features/caip'

export function addressAgnosticIsCaipEqual(
  a: ParsedCaipType,
  b: ParsedCaipType
) {
  return (
    stringifyCaip({ parsedCaipType: a, suppressAddressComponent: true }) ===
    stringifyCaip({ parsedCaipType: b, suppressAddressComponent: true })
  )
}
