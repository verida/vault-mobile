import { ChainId } from 'caip'
import { keyStores } from 'near-api-js'

import { ChainMetadata } from '../../types'
import { nearCreateConnection } from './nearCreateConnection'

export async function getBalanceNear({
  address,
  chainId: caipChainId,
  chainMetadatas,
}: {
  readonly address: string
  readonly chainId: ChainId
  readonly chainMetadatas: ChainMetadata[]
}) {
  // TODO: Why do we need to pass a keystore?!
  const connection = await nearCreateConnection({
    keystore: new keyStores.InMemoryKeyStore(),
    chainMetadatas,
    caipChainId,
  })

  const account = await connection.account(address)

  return account.getAccountBalance()
}
