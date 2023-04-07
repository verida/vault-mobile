import { createAsyncThunk } from '@reduxjs/toolkit'
import * as sentry from '@sentry/react-native'

import { AssetManager } from 'api/AssetManager'
import { NFTCollection } from 'api/types'
import { RootState } from 'reduxStore/types'
import { getWalletsData } from 'reduxStore/wallet/selectors'

export const getWalletNFTCollections = createAsyncThunk<
  { wallet: string; collections: NFTCollection[] } | undefined,
  any,
  {
    state: RootState
  }
>('assets/NFTCollections', async (_, { getState }) => {
  const wallets = getWalletsData(getState().main)
  // FIXME: Test with eip155 wallet first
  const etherWallet = wallets.eip155.address as string
  try {
    const response = await AssetManager.getInstance().getWalletNFTCollections({
      wallet: etherWallet,
      limit: 10,
    })

    // Parse NFT metadata, also try to fetch from nft.token_uri in case metadata is missing
    for await (const collection of response.collections ?? []) {
      for await (const nft of collection?.nfts?.data ?? []) {
        try {
          if (!nft.metadata || !JSON.parse(nft?.metadata ?? '{}')?.image) {
            const metaFetch = await fetch(nft.token_uri!)
            const json = await metaFetch.json()
            nft.metadata = json
          } else {
            nft.metadata = JSON.parse(nft.metadata ?? '{}')
          }
        } catch (error) {
          // sentry.captureException(error)
        }
      }
    }

    return {
      wallet: etherWallet,
      collections: response.collections,
    }
  } catch (error) {
    sentry.captureException(error)
  }
})
