import * as Sentry from '@sentry/react-native'
import { NearDevAccount, nearKeyPairFromPrivateKey } from 'features/near'

export async function createDevAccount({
  privateKey,
}: {
  readonly privateKey: string
}): Promise<NearDevAccount> {
  const keyPair = nearKeyPairFromPrivateKey({ privateKey })

  const randomNumber = Math.floor(
    Math.random() * (99999999999999 - 10000000000000) + 10000000000000
  )

  // TODO: Remove temp generating account id(named account) with an update from wallet-utils
  const accountId = `dev-vda-${Date.now()}-${randomNumber}`
  const publicKey = keyPair.getPublicKey().toString()

  try {
    const res = await fetch(`https://helper.testnet.near.org/account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newAccountId: accountId,
        newAccountPublicKey: publicKey,
      }),
    })

    if (!res.ok) throw new Error(await res.text())

    return { accountId, keyPair }
  } catch (error) {
    Sentry.captureException(error)
    throw new Error('Failed to create NEAR dev account')
  }
}
