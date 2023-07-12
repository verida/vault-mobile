import { ParsedCaipType } from 'features/caip'
import { keyStores } from 'near-api-js'

import { NearAccountPointer } from '../@types'

export async function nearGetAccounts({
  keystore,
  parsedCaipType,
}: {
  readonly keystore: keyStores.KeyStore
  readonly parsedCaipType: ParsedCaipType
}): Promise<readonly NearAccountPointer[]> {
  const { reference: networkId } = parsedCaipType
  return (
    await Promise.allSettled(
      (
        await keystore.getAccounts(networkId)
      ).map(async (accountId: string): Promise<NearAccountPointer> => {
        const keypair = await keystore.getKey(networkId, accountId)
        const publicKey = keypair.getPublicKey().toString()
        return { publicKey, accountId }
      })
    )
  ).flatMap((e) => (e.status === 'fulfilled' ? [e.value] : []))
}
