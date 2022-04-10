import { convertHexToUtf8 } from '@walletconnect/utils'

import { SUPPORTED_CHAINS } from '../constants'
import { getLocal } from './local'
import { IChainData } from './types'

export function payloadId(): number {
  const datePart: number = new Date().getTime() * Math.pow(10, 3)
  const extraPart: number = Math.floor(Math.random() * Math.pow(10, 3))
  const id: number = datePart + extraPart
  return id
}

export function getChainData(chainId: number): IChainData {
  const chainData = SUPPORTED_CHAINS.filter(
    (chain: any) => chain.chain_id === chainId
  )[0]

  if (!chainData) {
    throw new Error('ChainId missing or not supported')
  }

  // TODO: remove this when we have a better way to handle this
  const API_KEY = '6e4bf0201647493e93c9eea13b70bd4d'

  if (!API_KEY) {
    throw new Error(
      'Environment variable REACT_APP_INFURA_PROJECT_ID is not set'
    )
  }

  if (
    chainData.rpc_url.includes('infura.io') &&
    chainData.rpc_url.includes('%API_KEY%') &&
    API_KEY
  ) {
    const rpcUrl = chainData.rpc_url.replace('%API_KEY%', API_KEY)

    return {
      ...chainData,
      rpc_url: rpcUrl,
    }
  }

  return chainData
}

export function convertHexToUtf8IfPossible(hex: string) {
  try {
    return convertHexToUtf8(hex)
  } catch (e) {
    return hex
  }
}

export function getCachedSession(): any {
  const session = getLocal('walletconnect')
  return session
}
