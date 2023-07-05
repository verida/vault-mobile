import {
  getNearNodeUrlOrThrow,
  NearAccountPointer,
  NearNetworkId,
} from 'features/near'
import { providers } from 'near-api-js'

import { nearCreateViewAccessKey } from './nearCreateViewAccessKey'

export async function nearDoesAccountExist({
  nearAccountPointer,
  nearNetworkId,
}: {
  readonly nearAccountPointer: NearAccountPointer
  // TODO: @cawfree should networkId be inside pointer? probably?
  readonly nearNetworkId: NearNetworkId
}) {
  const provider = new providers.JsonRpcProvider(
    getNearNodeUrlOrThrow(nearNetworkId)
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
