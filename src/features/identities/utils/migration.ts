import { EnvironmentType } from '@verida/types'

import { getNetworkFromDID } from './network'

export function canMigrateToMainnet(did: string) {
  const network = did ? getNetworkFromDID(did) : undefined

  return network === EnvironmentType.TESTNET
  // TODO: Check if the DID already exists on Mainnet, if so we should not allow the migration either
}
