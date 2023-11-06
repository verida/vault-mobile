import { ChainMetadatas } from 'features/caip'
import { utils } from 'near-api-js'

import { NearAccount } from '../@types'
import { nearCreateConnection } from './nearCreateConnection'
import { nearDoesAccountExist } from './nearDoesAccountExist'

export async function nearInstantiateAccount({
  chainMetadatas,
  nearAccount,
}: {
  readonly chainMetadatas: ChainMetadatas
  readonly nearAccount: NearAccount
}) {
  const { accountId, publicKey, caipChainId, keystore } = nearAccount

  const connection = await nearCreateConnection({
    keystore,
    chainMetadatas,
    caipChainId,
  })

  const createdAccount = await connection.createAccount(
    accountId,
    utils.PublicKey.from(publicKey)
  )

  const [balance, details, state] = await Promise.all([
    createdAccount.getAccountBalance(),
    createdAccount.getAccountDetails(),
    createdAccount.state(),
  ])

  // eslint-disable-next-line no-console
  __DEV__ && console.warn(JSON.stringify({ balance, details, state }))

  // Wait a little for the network to sync up.
  await new Promise((resolve) => setTimeout(resolve, 5000))

  const doesExist = await nearDoesAccountExist({
    chainMetadatas,
    nearAccountPointer: nearAccount,
    caipChainId,
  })

  if (!doesExist) throw new Error(`NearAccount does not exist after creation!`)
}
