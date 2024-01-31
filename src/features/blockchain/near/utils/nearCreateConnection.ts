import { ChainId } from 'caip'
import { ChainMetadatas } from 'features/blockchain'
import { connect, keyStores } from 'near-api-js'

import { getNearNetworkConfig } from '../constants'

export async function nearCreateConnection({
  keystore,
  caipChainId,
  chainMetadatas,
}: {
  readonly keystore: keyStores.KeyStore
  readonly caipChainId: ChainId
  readonly chainMetadatas: ChainMetadatas
}) {
  return await connect(
    await getNearNetworkConfig({
      keystore,
      chainMetadatas,
      caipChainId,
    })
  )
}
