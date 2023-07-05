import { NearAccount } from '../@types'
import { getNearNetworkConfig } from '../constants'
import { nearDoesAccountExist } from './nearDoesAccountExist'

export async function nearInstantiateAccount(nearAccount: NearAccount) {
  const { accountId, publicKey, nearNetworkId } = nearAccount
  const { helperUrl } = getNearNetworkConfig(nearAccount)
  const res = await fetch(`${helperUrl}/account`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      newAccountId: accountId,
      newAccountPublicKey: publicKey,
    }),
  })

  const result = await res.text()

  if (!res.ok) throw new Error(result)

  // eslint-disable-next-line no-console
  __DEV__ && console.warn(result)

  const doesExist = await nearDoesAccountExist({
    nearAccountPointer: nearAccount,
    nearNetworkId,
  })

  if (!doesExist) throw new Error(`NearAccount does not exist after creation!`)
}
