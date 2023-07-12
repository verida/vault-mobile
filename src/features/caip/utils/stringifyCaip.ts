import { ParsedCaipType } from '../@types'

export function stringifyCaip({
  parsedCaipType,
  suppressAddressComponent,
}: {
  readonly parsedCaipType: ParsedCaipType
  readonly suppressAddressComponent: boolean
}): string {
  return `${parsedCaipType.namespace}:${parsedCaipType.reference}${
    parsedCaipType.address && !suppressAddressComponent
      ? `:${parsedCaipType.address}`
      : ''
  }`
}
