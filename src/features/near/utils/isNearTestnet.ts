import { ParsedCaipType, stringifyCaip } from 'features/caip'

import { NearNetworkId } from '../@types'

export function isNearTestnet(nearNetworkParsedCaipType: ParsedCaipType) {
  return stringifyCaip(nearNetworkParsedCaipType) === NearNetworkId.TESTNET
}
