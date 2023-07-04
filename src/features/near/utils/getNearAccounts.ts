import { NearWalletAccountInfo, NearWalletInstance } from '../@types'

export async function getNearAccounts({
  keystore,
  nearNetworkParsedCaipType,
}: Pick<NearWalletInstance, 'keystore' | 'nearNetworkParsedCaipType'>) {
  const allAccounts = await keystore.getAccounts(
    nearNetworkParsedCaipType.chainId
  )

  const maybeMatchingAccounts = await Promise.allSettled(
    allAccounts.map(async (accountId): Promise<NearWalletAccountInfo> => {
      const keypair = await keystore.getKey(
        nearNetworkParsedCaipType.chainId,
        accountId
      )
      const publicKey = keypair.getPublicKey().toString()
      return { publicKey, accountId }
    })
  )

  return maybeMatchingAccounts.flatMap((e) =>
    e.status === 'fulfilled' ? [e.value] : []
  )
}
