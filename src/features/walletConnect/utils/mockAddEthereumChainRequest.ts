import { ChainId } from 'caip'

import {
  AddEthereumChainRequestParam,
  Eip155RpcMethod,
} from '../../blockchain/eip155/@types'
import { WalletConnectRequestParams } from '../@types'

export function mockAddEthereumChainRequest({
  chainId,
  topic,
  params,
}: {
  readonly chainId: ChainId
  readonly topic: string
  readonly params: readonly AddEthereumChainRequestParam[]
}): WalletConnectRequestParams {
  return {
    topic,
    chainId: chainId.toString(),
    request: {
      method: Eip155RpcMethod.ADD_ETHEREUM_CHAIN,
      params,
    },
  }
}
