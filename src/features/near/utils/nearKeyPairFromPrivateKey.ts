import { utils } from 'near-api-js'

export function nearKeyPairFromPrivateKey({
  privateKey,
}: {
  readonly privateKey: string
}) {
  return utils.KeyPair.fromString(privateKey)
}
