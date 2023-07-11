import { ParsedCaipType } from '../@types'

export function stringifyCaip({
  parsedCaipType,
  suppressAddressComponent,
}: {
  readonly parsedCaipType: ParsedCaipType
  readonly suppressAddressComponent: boolean
}): string {
  return `${parsedCaipType.standard}:${parsedCaipType.chainId}${
    parsedCaipType.address && !suppressAddressComponent
      ? `:${parsedCaipType.address}`
      : ''
  }`
}
