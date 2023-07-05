import { connect, keyStores } from 'near-api-js'

import { NearNetworkId } from '../@types'

export function getNearNetworkConfig({
  keystore: keyStore,
  nearNetworkId,
}: {
  readonly keystore: keyStores.KeyStore
  readonly nearNetworkId: NearNetworkId
}): Parameters<typeof connect>[0] & {
  // https://docs.near.org/tools/near-api-js/quick-reference#connect
  readonly explorerUrl: string
} {
  if (nearNetworkId !== NearNetworkId.TESTNET)
    throw new Error(`Encountered unsupported network, "${nearNetworkId}".`)

  return {
    networkId: 'testnet',
    keyStore,
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://explorer.testnet.near.org',
    // TODO: ?? idk what is needed here
    headers: {},
  }
}
