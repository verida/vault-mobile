import { ChainIdParams } from 'caip'

import { SupportedCaipNamespace } from '../@types'

// TODO: It is not ideal to work this way (knowing a specific reference), however
//       the implementation of Near protocol demands we do this for when we generate
//       NEAR metadata URLs.
export const NEAR_TESTNET_CAIP: ChainIdParams = {
  namespace: SupportedCaipNamespace.NEAR,
  reference: 'testnet',
}
