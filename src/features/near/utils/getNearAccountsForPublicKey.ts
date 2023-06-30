import { NearWalletAccountInfo, NearWalletInstance } from 'features/near'

import { getNearAccounts } from './getNearAccounts'

export async function getNearAccountsForPublicKey({
  keystore,
  publicKey,
  networkId,
}: Pick<NearWalletInstance, 'keystore' | 'publicKey' | 'networkId'>): Promise<
  readonly NearWalletAccountInfo[]
> {
  const accounts: readonly NearWalletAccountInfo[] = await getNearAccounts({
    keystore,
    networkId,
  })

  return accounts.filter(
    ({ publicKey: maybeMatchingPublicKey }) =>
      maybeMatchingPublicKey === publicKey
  )
}
