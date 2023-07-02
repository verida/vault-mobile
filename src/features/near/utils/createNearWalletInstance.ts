import { ParsedCaipType } from 'features/caip'
import {
  createDevAccount,
  getNearAccountsForPublicKey,
  NearDevAccount,
  NearWalletAccountInfo,
  NearWalletInstance,
} from 'features/near'

import { NearKeystore } from '../classes'

export async function createNearWalletInstance({
  keystore,
  publicKey,
  privateKey,
  nearNetworkParsedCaipType,
  // just one account for now
  maxAccounts = 1,
}: {
  readonly keystore: NearKeystore
  readonly nearNetworkParsedCaipType: ParsedCaipType
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
    nearNetworkParsedCaipType,
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

    await keystore.setKey(nearNetworkParsedCaipType.chainId, accountId, keyPair)
  }

  const nearWalletInstance: NearWalletInstance = {
    nearNetworkParsedCaipType,
    keystore,
    publicKey,
  }

  return { nearWalletInstance, nearWalletAccounts }
}
