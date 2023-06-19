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
  publicKey,
  privateKey,
  networkId,
  // just one account for now
  maxAccounts = 1,
}: {
  readonly networkId: NearNetworkId
  readonly publicKey: string
  readonly privateKey: string
  readonly maxAccounts?: number
}): Promise<{
  readonly nearWalletInstance: NearWalletInstance
  readonly nearWalletAccounts: readonly NearWalletAccountInfo[]
}> {
  const keystore = new NearKeystore()

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
    // TODO: Dangerous!
    //       Here, there is no explicit relationship between the publicKey and
    //       private key. We are relying on generating a know set of contiguous
    //       accounts, but this will not always be true.
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
