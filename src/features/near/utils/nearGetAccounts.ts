import { parseCaipOrThrow } from 'features/caip'
import { keyStores } from 'near-api-js'

import { NearAccountPointer, NearNetworkId } from '../@types'

export async function nearGetAccounts({
  keystore,
  nearNetworkId,
}: {
  readonly keystore: keyStores.KeyStore
  readonly nearNetworkId: NearNetworkId
}): Promise<readonly NearAccountPointer[]> {
  const { chainId: networkId } = parseCaipOrThrow(nearNetworkId)
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
