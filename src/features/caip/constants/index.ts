import { ParsedCaipType, SupportedCaipProtocolStandard } from '../@types'

// TODO: It is not ideal to work this way (knowing a specific chainId), however
//       the implementation of Near protocol demands we do this for when we generate
//       NEAR metadata URLs.
export const NEAR_TESTNET_CAIP: ParsedCaipType<SupportedCaipProtocolStandard.NEAR> =
  {
    address: undefined,
    standard: SupportedCaipProtocolStandard.NEAR,
    chainId: 'testnet',
  }
