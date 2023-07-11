import {
  getRpcUrlOrThrow,
  ParsedCaipType,
  SupportedCaipProtocolStandard,
} from 'features/caip'
import { NearAccountPointer } from 'features/near'
import { providers } from 'near-api-js'

import { nearCreateViewAccessKey } from './nearCreateViewAccessKey'

export async function nearDoesAccountExist({
  nearAccountPointer,
  parsedCaipType,
}: {
  readonly nearAccountPointer: NearAccountPointer
  // TODO: @cawfree should networkId be inside pointer? probably?
  readonly parsedCaipType: ParsedCaipType<SupportedCaipProtocolStandard.NEAR>
}) {
  const provider = new providers.JsonRpcProvider(
    getRpcUrlOrThrow(parsedCaipType)
  )

  try {
    await nearCreateViewAccessKey({
      provider,
      nearAccountPointer,
    })

    return true
  } catch (e) {
    if (!(e instanceof Error)) throw e

    const { message } = e

    if (message.includes('does not exist while viewing')) return false

    throw e
  }
}
