/* eslint-disable @typescript-eslint/no-unused-vars */
import { walletProviderApi } from 'wallet/helpers/api'

import { walletBadges } from './mocks/WalletBadges'
import { walletNFTs } from './mocks/WalletNfts'
import { BadgeData, WalletNFTsResponse } from './types'

class AssetManager {
  public async getWalletNFTs(params: {
    wallets: string[]
    chain: string
    limit: number
    cursor?: string
  }): Promise<Record<string, WalletNFTsResponse>> {
    const wallets = [
      '0x12345678901234567890123456789012345622312',
      '0x45645678901234567890123456789012345629889',
    ]
    const chain = 'eip155:1'
    const limit = 10 // # items per page

    // ex: walletNFTs?wallet=0x34e77AD857217D8D93dcC0bAE752E2290A2EFb66&chain=eip155:1&limit=30
    // const response = await walletProviderApi.get(
    //   `nfts?${params.wallets.map((wallet) => `wallet=${wallet}`).join('&')}` +
    //     `&chain=${chain}` +
    //     `limit=${limit}`
    // )
    // return response.data.data

    // Mock data
    return walletNFTs
  }

  public async getWalletBadges(wallet: string): Promise<BadgeData[]> {
    // ex: walletBadges?wallet=0x34e77AD857217D8D93dcC0bAE752E2290A2EFb66
    // const response = await walletProviderApi.get(
    //   `walletBadges?wallet=${wallet}`
    // )
    // return response.data.data

    // Mock data
    return walletBadges
  }

  public async claimBadge(wallet: string, assetId: string): Promise<BadgeData> {
    // ex: claimBadge?wallet=0x34e77AD857217D8D93dcC0bAE752E2290A2EFb66
    // const request = await walletProviderApi.get(
    //   `claimBadge?` + `wallet=${wallet}&assetId=${assetId}`
    // )

    return walletBadges[0]
  }
}
