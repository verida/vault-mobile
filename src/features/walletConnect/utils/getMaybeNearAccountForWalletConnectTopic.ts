import { ParsedCaipType } from 'features/caip'
import { getNearAccounts, NearKeystore } from 'features/near'

export async function getMaybeNearAccountForWalletConnectTopic({
  topic,
  keystore,
  nearNetworkParsedCaipType,
}: {
  readonly topic: string
  readonly keystore: NearKeystore
  readonly nearNetworkParsedCaipType: ParsedCaipType
}) {
  const nearAccounts = await getNearAccounts({
    keystore,
    nearNetworkParsedCaipType,
  })

  return nearAccounts.filter((e) => e.publicKey === topic)
}
