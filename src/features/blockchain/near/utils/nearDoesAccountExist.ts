import { ChainId } from 'caip'
import { ChainMetadatas, getRpcUrlOrThrow } from 'features/caip'
import { providers } from 'near-api-js'

import { NearAccountPointer } from '../@types'
import { nearCreateViewAccessKey } from './nearCreateViewAccessKey'

export async function nearDoesAccountExist({
  chainMetadatas,
  nearAccountPointer,
  caipChainId,
}: {
  readonly chainMetadatas: ChainMetadatas
  readonly nearAccountPointer: NearAccountPointer
  readonly caipChainId: ChainId
}) {
  const provider = new providers.JsonRpcProvider(
    getRpcUrlOrThrow(chainMetadatas, caipChainId)
  )

  try {
    await nearCreateViewAccessKey({
      provider,
      nearAccountPointer,
    })

    return true
  } catch (error) {
    if (!(error instanceof Error)) throw error

    const { message } = error

    if (message.includes('does not exist while viewing')) return false

    throw error
  }
}
