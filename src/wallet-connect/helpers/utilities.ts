import { convertHexToUtf8 } from '@walletconnect/utils'
import Config from 'react-native-config'

import { SUPPORTED_CHAINS } from '../constants'
import { IChainData } from '../types'

// TODO: hardcode just to have a running build first, fix Bitrise .env config
const { INFURA_API_KEY = '6e4bf0201647493e93c9eea13b70bd4d' } = Config

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

  if (!INFURA_API_KEY) {
    throw new Error(
      'Environment variable REACT_APP_INFURA_PROJECT_ID is not set'
    )
  }

  if (
    chainData.rpc_url.includes('infura.io') &&
    chainData.rpc_url.includes('%API_KEY%') &&
    INFURA_API_KEY
  ) {
    const rpcUrl = chainData.rpc_url.replace('%API_KEY%', INFURA_API_KEY)

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

export function ethNetworkFee(limitGwei: number, gasLimitGwei: number) {
  return (limitGwei * gasLimitGwei) / 1000000000
}

export function weiToGwei(wei: number): number {
  return wei / 1000000000
}

export function gweiToEther(gwei: number): number {
  return gwei / 1000000000
}
