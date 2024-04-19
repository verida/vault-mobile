import { ChainId } from 'caip'
import { connect, keyStores } from 'near-api-js'

import { ChainMetadata } from '../../types'
import { getNearNetworkConfig } from '../constants'

export async function nearCreateConnection({
  keystore,
  caipChainId,
  chainMetadatas,
}: {
  readonly keystore: keyStores.KeyStore
  readonly caipChainId: ChainId
  readonly chainMetadatas: ChainMetadata[]
}) {
  return await connect(
    await getNearNetworkConfig({
      keystore,
      chainMetadatas,
      caipChainId,
    })
  )
}
