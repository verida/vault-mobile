import { ChainId } from 'caip'
import { RpcSelector } from 'features/blockchain/@types'
import { ChainMetadatas } from 'features/caip'
import { connect, keyStores } from 'near-api-js'

import { getNearNetworkConfig } from '../constants'

export async function nearCreateConnection({
  keystore,
  caipChainId,
  chainMetadatas,
  rpcSelector,
}: {
  readonly keystore: keyStores.KeyStore
  readonly caipChainId: ChainId
  readonly chainMetadatas: ChainMetadatas
  readonly rpcSelector: RpcSelector
}) {
  return await connect(
    await getNearNetworkConfig({
      keystore,
      chainMetadatas,
      caipChainId,
      rpcSelector,
    })
  )
}
