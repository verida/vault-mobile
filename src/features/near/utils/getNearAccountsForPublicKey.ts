import {
  getNearAccounts,
  NearWalletAccountInfo,
  NearWalletInstance,
} from 'features/near'

export async function getNearAccountsForPublicKey({
  keystore,
  publicKey,
  nearNetworkParsedCaipType,
}: Pick<
  NearWalletInstance,
  'keystore' | 'publicKey' | 'nearNetworkParsedCaipType'
>): Promise<readonly NearWalletAccountInfo[]> {
  const accounts: readonly NearWalletAccountInfo[] = await getNearAccounts({
    keystore,
    nearNetworkParsedCaipType,
  })

  return accounts.filter(
    ({ publicKey: maybeMatchingPublicKey }) =>
      maybeMatchingPublicKey === publicKey
  )
}
