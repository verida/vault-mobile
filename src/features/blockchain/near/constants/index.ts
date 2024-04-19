import { ChainId, ChainIdParams } from 'caip'
import { connect, keyStores } from 'near-api-js'

import { Blockchain } from '../../types'
import { getRpcUrlOrThrow } from '../../utils'

// TODO: It is not ideal to work this way (knowing a specific reference), however the implementation of Near protocol demands we do this for when we generate NEAR metadata URLs.
export const NEAR_TESTNET_CAIP: ChainIdParams = {
  namespace: 'near',
  reference: 'testnet',
}

export async function getNearNetworkConfig({
  chainMetadatas,
  keystore: keyStore,
  caipChainId,
}: {
  readonly chainMetadatas: Blockchain[]
  readonly keystore: keyStores.KeyStore
  readonly caipChainId: ChainId
}): Promise<
  Parameters<typeof connect>[0] & {
    // https://docs.near.org/tools/near-api-js/quick-reference#connect
    readonly explorerUrl: string
  }
> {
  // TODO: If near mainnet URLs are simply "mainnet" we should be okay to remove this
  //       and evaluate the URLs below dynamically.
  // HACK: We must to explicitly code for a NEAR CAIP identifier because
  //       we're forced to hardcode different URLs below.
  if (caipChainId.toString() !== ChainId.format(NEAR_TESTNET_CAIP))
    throw new Error(
      `Encountered unsupported network, "${caipChainId.toString()}".`
    )

  const { reference: networkId } = caipChainId

  return {
    keyStore,
    networkId, // i.e. "testnet"
    nodeUrl: await getRpcUrlOrThrow({
      chainMetadatas,
      chainId: caipChainId,
    }),
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://explorer.testnet.near.org',

    // HACK: The typing demanded declaration of this value.
    headers: {},
  }
}
