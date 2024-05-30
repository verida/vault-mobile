/* eslint-disable @typescript-eslint/no-unused-vars */
import { walletProviderApi } from '~/features/walletProvider'

import { walletBadges, walletNFTs } from '../mocks'
import { Badge, ClaimBadgeResponse, WalletNFTsResponse } from '../types'

export class AssetManager {
  private static instance: AssetManager

  public static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager()
    }
    return AssetManager.instance
  }

  /**
   * Get wallet NFT collections
   *
   * Ex: walletNFTs?wallet=0x34e77AD857217D8D93dcC0bAE752E2290A2EFb66&limit=10
   */
  public async getWalletNFTCollections(params: {
    wallet: string
    limit: number
    cursor?: string
  }): Promise<WalletNFTsResponse> {
    // const wallet = 'eip155:1:0x12345678901234567890123456789012345622312'
    // const limit = 10 // # items per page

    // const response = await walletProviderApi.get(
    //   `nfts?${`wallet=${params.wallet}limit=${params.limit}`}`
    // )
    // return response.data.data

    // Mock data
    return walletNFTs
  }

  /**
   * Get wallet badges
   *
   * Ex: walletBadges?wallet=0x34e77AD857217D8D93dcC0bAE752E2290A2EFb66
   */
  public async getWalletBadges(wallet: string): Promise<Badge[]> {
    // ex: walletBadges?wallet=0x34e77AD857217D8D93dcC0bAE752E2290A2EFb66
    // const response = await walletProviderApi.get(
    //   `walletBadges?wallet=${wallet}`
    // )
    // return response.data.data

    // Mock data
    return walletBadges
  }

  /**
   * Claim badge for a wallet
   */
  public async claimBadge(
    wallet: string,
    assetId: string
  ): Promise<ClaimBadgeResponse> {
    // const request = await walletProviderApi.post(`claimBadge`, {
    //   wallet,
    //   assetId,
    // })

    return { badge: walletBadges[0], success: true }
  }
}
