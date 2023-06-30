import {
  getNearAccounts,
  NearKeystore,
  NearNetworkId,
  NearTransaction,
  NearWalletAccountInfo,
} from 'features/near'

export async function getMaybeNearAccountForTransactionSignatory({
  keystore,
  nearNetworkId,
  transaction,
}: {
  readonly keystore: NearKeystore
  readonly nearNetworkId: NearNetworkId
  readonly transaction: NearTransaction
}): Promise<NearWalletAccountInfo | undefined> {
  const accounts = await getNearAccounts({
    keystore,
    networkId: nearNetworkId,
  })

  const maybeAccount = accounts.find(
    ({ accountId }) => accountId === transaction.signerId
  )

  return maybeAccount || undefined
}
