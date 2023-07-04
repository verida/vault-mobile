import { ParsedCaipType } from 'features/caip'

import {
  NearDevAccount,
  NearWalletAccountInfo,
  NearWalletInstance,
} from '../@types'
import { NearKeystore } from '../classes'
import { getNearAccountsForPublicKey } from './getNearAccountsForPublicKey'
import { nearCreateDevAccount } from './nearCreateDevAccount'

export async function nearCreateWalletInstance({
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
    const nearDevAccount: NearDevAccount = await nearCreateDevAccount({
      nearNetworkParsedCaipType,
      privateKey,
    })

    const { accountId, keyPair } = nearDevAccount

    if (keyPair.getPublicKey().toString() !== publicKey)
      throw new Error('Failed to create account for contiguous public key.')

    await keystore.setKey(nearNetworkParsedCaipType.chainId, accountId, keyPair)
  }

  const nearWalletInstance: NearWalletInstance = {
    nearNetworkParsedCaipType,
    keystore,
    publicKey,
  }

  return { nearWalletInstance, nearWalletAccounts }
}
