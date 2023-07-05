import { NearAccountPointer } from 'features/near'
import { providers } from 'near-api-js'
import { AccessKeyView } from 'near-api-js/lib/providers/provider'

export function nearCreateViewAccessKey({
  provider,
  nearAccountPointer: { accountId: account_id, publicKey: public_key },
}: {
  readonly provider: providers.Provider
  readonly nearAccountPointer: NearAccountPointer
}) {
  return provider.query<AccessKeyView>({
    request_type: 'view_access_key',
    finality: 'final',
    account_id,
    public_key,
  })
}
