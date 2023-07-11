import { connect, utils } from 'near-api-js'

import { NearAccount } from '../@types'
import { getNearNetworkConfig } from '../constants'
import { nearDoesAccountExist } from './nearDoesAccountExist'

export async function nearInstantiateAccount(nearAccount: NearAccount) {
  const { accountId, publicKey, parsedCaipType } = nearAccount

  const connection = await connect(getNearNetworkConfig(nearAccount))

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
    nearAccountPointer: nearAccount,
    parsedCaipType,
  })

  if (!doesExist) throw new Error(`NearAccount does not exist after creation!`)
}
