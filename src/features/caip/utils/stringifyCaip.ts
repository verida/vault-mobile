import { ParsedCaipType } from 'features/caip'

export function stringifyCaip(
  parsedCaipType: ParsedCaipType,
  suppressAddressComponent = false
): string {
  return `${parsedCaipType.protocol}:${parsedCaipType.chainId}${
    parsedCaipType.address && !suppressAddressComponent
      ? `:${parsedCaipType.address}`
      : ''
  }`
}
