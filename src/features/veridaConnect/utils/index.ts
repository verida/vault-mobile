import { EnvironmentType } from '@verida/types'

export function isNetworkCompatibleForConnect(
  identityNetwork: EnvironmentType,
  requestNetwork: EnvironmentType
) {
  if (identityNetwork === requestNetwork) {
    // If same network
    return true
  }

  if (
    (identityNetwork === EnvironmentType.TESTNET ||
      identityNetwork === EnvironmentType.DEVNET) &&
    (requestNetwork === EnvironmentType.TESTNET ||
      requestNetwork === EnvironmentType.DEVNET)
  ) {
    // If both networks are testnet or devnet, they are compatible
    return true
  }

  return false
}
