import { ChainId } from 'caip'
import { ChainMetadatas } from 'features/caip'
import { keyStores } from 'near-api-js'

import { nearCreateConnection } from './nearCreateConnection'

export async function getBalanceNear({
  address,
  chainId: caipChainId,
  chainMetadatas,
}: {
  readonly address: string
  readonly chainId: ChainId
  readonly chainMetadatas: ChainMetadatas
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
