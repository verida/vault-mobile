import { NearWalletAccountInfo, NearWalletInstance } from 'features/near'

export async function getNearAccountsForPublicKey({
  keystore,
  publicKey,
  networkId,
}: Pick<NearWalletInstance, 'keystore' | 'publicKey' | 'networkId'>): Promise<
  readonly NearWalletAccountInfo[]
> {
  const allAccounts = await keystore.getAccounts(networkId)

  const maybeMatchingAccounts = await Promise.allSettled(
    allAccounts.map(
      async (accountId): Promise<NearWalletAccountInfo | null> => {
        const keypair = await keystore.getKey(networkId, accountId)

        return keypair.getPublicKey().toString() === publicKey
          ? { publicKey, accountId }
          : null
      }
    )
  )

  return maybeMatchingAccounts.flatMap(
    (maybeMatchingAccount): readonly NearWalletAccountInfo[] => {
      if (maybeMatchingAccount.status !== 'fulfilled') return []

      if (!maybeMatchingAccount.value) return []

      return [maybeMatchingAccount.value]
    }
  )
}
