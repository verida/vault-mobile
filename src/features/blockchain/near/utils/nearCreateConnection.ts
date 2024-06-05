import { ChainId } from 'caip'
import { connect, keyStores } from 'near-api-js'

import { ChainMetadatas } from '~/features/caip'

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
