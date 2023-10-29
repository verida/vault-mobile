import { ChainId } from 'caip'
import { RpcSelector } from 'features/blockchain/@types'
import {
  ChainMetadatas,
  getRpcUrlOrThrow,
  NEAR_TESTNET_CAIP,
} from 'features/caip'
import { connect, keyStores } from 'near-api-js'

export async function getNearNetworkConfig({
  chainMetadatas,
  keystore: keyStore,
  caipChainId,
  rpcSelector,
}: {
  readonly chainMetadatas: ChainMetadatas
  readonly keystore: keyStores.KeyStore
  readonly caipChainId: ChainId
  readonly rpcSelector: RpcSelector
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
      rpcSelector,
    }),
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://explorer.testnet.near.org',

    // HACK: The typing demanded declaration of this value.
    headers: {},
  }
}
