import { ChainIdParams } from 'caip'
import { $enum } from 'ts-enum-util'

import { SupportedCaipNamespace } from '../@types'

// TODO: Should probably be moved under `features/blockchains`
export const SUPPORTED_BLOCKCHAIN_NAMESPACES = [
  ...$enum(SupportedCaipNamespace).values(),
]

// TODO: It is not ideal to work this way (knowing a specific reference), however
//       the implementation of Near protocol demands we do this for when we generate
//       NEAR metadata URLs.
export const NEAR_TESTNET_CAIP: ChainIdParams = {
  namespace: SupportedCaipNamespace.NEAR,
  reference: 'testnet',
}
