import { ChainId } from 'caip'
import { keyStores } from 'near-api-js'

import { NearAccountPointer } from '../@types'

export async function nearGetAccounts({
  keystore,
  caipChainId,
}: {
  readonly keystore: keyStores.KeyStore
  readonly caipChainId: ChainId
}): Promise<readonly NearAccountPointer[]> {
  const { reference: networkId } = caipChainId
  return (
    await Promise.allSettled(
      (
        await keystore.getAccounts(networkId)
      ).map(async (accountId: string): Promise<NearAccountPointer> => {
        const keypair = await keystore.getKey(networkId, accountId)
        const publicKey = keypair.getPublicKey().toString()
        return { publicKey, signerId: accountId }
      })
    )
  ).flatMap((e) => (e.status === 'fulfilled' ? [e.value] : []))
}
