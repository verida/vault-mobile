import { ChainId } from 'caip'
import { ChainMetadatas, getRpcUrlOrThrow } from 'features/caip'
import { RpcSelector } from 'features/walletConnect'
import { providers } from 'near-api-js'

import { NearAccountPointer } from '../@types'
import { nearCreateViewAccessKey } from './nearCreateViewAccessKey'

export async function nearDoesAccountExist({
  chainMetadatas,
  nearAccountPointer,
  caipChainId,
  rpcSelector,
}: {
  readonly chainMetadatas: ChainMetadatas
  readonly nearAccountPointer: NearAccountPointer
  readonly caipChainId: ChainId
  readonly rpcSelector: RpcSelector
}) {
  const provider = new providers.JsonRpcProvider(
    getRpcUrlOrThrow({ chainMetadatas, chainId: caipChainId, rpcSelector })
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
