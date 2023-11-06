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
    await getRpcUrlOrThrow({
      chainMetadatas,
      chainId: caipChainId,
    })
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
