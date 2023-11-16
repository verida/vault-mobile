//import * as Sentry from '@sentry/react-native'
import { create } from 'apisauce'
import { config } from 'config'
//import { BlockchainNetwork } from '../types'

export const walletProviderApi = create({
  baseURL: config.WALLET_PROVIDER_URL,
})

//export class WalletProvider {
//  public static async getBlockchainNetworks(): Promise<
//    Record<string, BlockchainNetwork>
//  > {
//    try {
//      const response: any = await walletProviderApi.get('chains/list')
//      const networkEntries =
//        response.data.data[`${CONFIG.WALLET_PROVIDER_CHAINS}`]
//
//      const allNetworks: Record<string, BlockchainNetwork> = {}
//      for (const chainId in networkEntries) {
//        const item = <BlockchainNetwork>networkEntries[chainId]
//        item.chainId = chainId
//        allNetworks[item.chainId] = item
//      }
//      return allNetworks
//    } catch (error) {
//      logger.error(error)
//    }
//
//    return {}
//  }
//}
//
