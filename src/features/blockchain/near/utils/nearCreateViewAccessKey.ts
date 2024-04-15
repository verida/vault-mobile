import { providers } from 'near-api-js'
import { AccessKeyView } from 'near-api-js/lib/providers/provider'

import { NearAccountPointer } from '../types'

export function nearCreateViewAccessKey({
  provider,
  nearAccountPointer: { publicKey: public_key, signerId },
}: {
  readonly provider: providers.Provider
  readonly nearAccountPointer: NearAccountPointer
}) {
  return provider.query<AccessKeyView>({
    request_type: 'view_access_key',
    finality: 'final',
    account_id: signerId,
    public_key,
  })
}
