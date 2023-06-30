import {
  createDevAccount,
  getNearAccountsForPublicKey,
  NearDevAccount,
  NearNetworkId,
  NearWalletAccountInfo,
  NearWalletInstance,
} from 'features/near'

import { NearKeystore } from '../classes'

export async function createNearWalletInstance({
  keystore,
  publicKey,
  privateKey,
  networkId,
  // just one account for now
  maxAccounts = 1,
}: {
  readonly keystore: NearKeystore
  readonly networkId: NearNetworkId
  readonly publicKey: string
  readonly privateKey: string
  readonly maxAccounts?: number
}): Promise<{
  readonly nearWalletInstance: NearWalletInstance
  readonly nearWalletAccounts: readonly NearWalletAccountInfo[]
}> {
  const nearWalletAccounts = await getNearAccountsForPublicKey({
    publicKey,
    keystore,
    networkId,
  })

  for (
    let i = 0;
    i < Math.max(maxAccounts - nearWalletAccounts.length, 0);
    i += 1
  ) {
    const nearDevAccount: NearDevAccount = await createDevAccount({
      privateKey,
    })

    const { accountId, keyPair } = nearDevAccount

    if (keyPair.getPublicKey().toString() !== publicKey)
      throw new Error('Failed to createDevAccount for contiguous public key.')

    await keystore.setKey(networkId, accountId, keyPair)
  }

  const nearWalletInstance: NearWalletInstance = {
    networkId,
    keystore,
    publicKey,
  }

  return { nearWalletInstance, nearWalletAccounts }
}
