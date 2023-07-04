import * as Sentry from '@sentry/react-native'
import { ParsedCaipType } from 'features/caip'

import { NearDevAccount } from '../@types'
import { isNearTestnet } from './isNearTestnet'
import { nearKeyPairFromPrivateKey } from './nearKeyPairFromPrivateKey'

export async function nearCreateDevAccount({
  nearNetworkParsedCaipType,
  privateKey,
}: {
  readonly nearNetworkParsedCaipType: ParsedCaipType
  readonly privateKey: string
}): Promise<NearDevAccount> {
  const keyPair = nearKeyPairFromPrivateKey({ privateKey })

  const randomNumber = Math.floor(
    Math.random() * (99999999999999 - 10000000000000) + 10000000000000
  )

  // TODO: Remove temp generating account id(named account) with an update from wallet-utils
  const accountId = `dev-vda-${Date.now()}-${randomNumber}`
  const publicKey = keyPair.getPublicKey().toString()

  const uri = `https://helper${
    isNearTestnet(nearNetworkParsedCaipType) ? '.testnet' : ''
  }.near.org/account`

  try {
    const res = await fetch(uri, {
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
