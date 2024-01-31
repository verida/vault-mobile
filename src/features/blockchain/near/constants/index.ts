import { ChainId } from 'caip'
import { ChainMetadatas, getRpcUrlOrThrow } from 'features/blockchain'
import { throwIfNotNearTestnet } from 'features/blockchain/near/utils'
import { connect, keyStores } from 'near-api-js'

export async function getNearNetworkConfig({
  chainMetadatas,
  keystore: keyStore,
  caipChainId,
}: {
  readonly chainMetadatas: ChainMetadatas
  readonly keystore: keyStores.KeyStore
  readonly caipChainId: ChainId
}): Promise<
  Parameters<typeof connect>[0] & {
    // https://docs.near.org/tools/near-api-js/quick-reference#connect
    readonly explorerUrl: string
  }
> {
  throwIfNotNearTestnet(caipChainId)

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
