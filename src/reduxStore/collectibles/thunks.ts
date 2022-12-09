import * as sentry from '@sentry/react-native'

import { AssetManager } from 'api/AssetManager'
import { AppThunk } from 'reduxStore/types'
import { getWalletsData } from 'reduxStore/wallet/selectors'

import * as actions from './actions'

export const getWalletNFTCollections = (): AppThunk => {
  return async (dispatch, getState) => {
    const wallets = getWalletsData(getState().main)
    // FIXME: Test with eip155 wallet first
    const etherWallet = wallets.eip155.address
    dispatch(actions.getWalletNFTCollectiblesRequest())
    try {
      const response = await AssetManager.getInstance().getWalletNFTCollections(
        {
          wallet: etherWallet,
          limit: 10,
        }
      )

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

      dispatch(
        actions.getWalletNFTCollectiblesRequestSuccess({
          wallet: etherWallet,
          collections: response.collections,
        })
      )
    } catch (error) {
      sentry.captureException(error)
      dispatch(
        actions.getWalletNFTCollectiblesRequestFailure({
          message: 'Unable load data',
        })
      )
    }
  }
}
