import { ChainMetadatas, getRpcUrlOrThrow, ParsedCaipType } from 'features/caip'
import { providers } from 'near-api-js'

import { NearAccountPointer } from '../@types'
import { nearCreateViewAccessKey } from './nearCreateViewAccessKey'

export async function nearDoesAccountExist({
  chainMetadatas,
  nearAccountPointer,
  parsedCaipType,
}: {
  readonly chainMetadatas: ChainMetadatas
  readonly nearAccountPointer: NearAccountPointer
  readonly parsedCaipType: ParsedCaipType
}) {
  const provider = new providers.JsonRpcProvider(
    getRpcUrlOrThrow(chainMetadatas, parsedCaipType)
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
