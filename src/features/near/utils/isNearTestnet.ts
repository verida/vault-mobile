import { ParsedCaipType, stringifyCaip } from 'features/caip'
import { NearNetworkId } from 'features/near'

export function isNearTestnet(nearNetworkParsedCaipType: ParsedCaipType) {
  return stringifyCaip(nearNetworkParsedCaipType) === NearNetworkId.TESTNET
}
