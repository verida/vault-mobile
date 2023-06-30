import { NearWalletAccountInfo, NearWalletInstance } from 'features/near'

export async function getNearAccounts({
  keystore,
  networkId,
}: Pick<NearWalletInstance, 'keystore' | 'networkId'>) {
  const allAccounts = await keystore.getAccounts(networkId)

  const maybeMatchingAccounts = await Promise.allSettled(
    allAccounts.map(async (accountId): Promise<NearWalletAccountInfo> => {
      const keypair = await keystore.getKey(networkId, accountId)
      const publicKey = keypair.getPublicKey().toString()
      return { publicKey, accountId }
    })
  )

  return maybeMatchingAccounts.flatMap((e) =>
    e.status === 'fulfilled' ? [e.value] : []
  )
}
