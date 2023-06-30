import { getNearAccounts, NearKeystore, NearNetworkId } from 'features/near'

export async function getMaybeNearAccountForWalletConnectTopic({
  topic,
  keystore,
  nearNetworkId,
}: {
  readonly topic: string
  readonly keystore: NearKeystore
  readonly nearNetworkId: NearNetworkId
}) {
  const nearAccounts = await getNearAccounts({
    keystore,
    networkId: nearNetworkId,
  })

  return nearAccounts.filter((e) => e.publicKey === topic)
}
