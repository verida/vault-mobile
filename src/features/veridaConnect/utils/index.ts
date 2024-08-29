import { Network } from '@verida/types'

export function isNetworkCompatibleForConnect(
  identityNetwork: Network,
  requestNetwork: Network
) {
  if (identityNetwork === requestNetwork) {
    // If same network
    return true
  }

  if (
    (identityNetwork === Network.BANKSIA ||
      identityNetwork === Network.DEVNET) &&
    (requestNetwork === Network.BANKSIA || requestNetwork === Network.DEVNET)
  ) {
    // If both networks are testnet or devnet, they are compatible
    return true
  }

  return false
}
