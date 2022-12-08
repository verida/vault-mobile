import { AssetManager } from 'api/AssetManager'
import { AppThunk } from 'reduxStore/types'
import { getWalletsData } from 'reduxStore/wallet/selectors'

import * as actions from './actions'

export const getWalletNFTCollections = (): AppThunk => {
  return async (dispatch, getState) => {
    const wallets = getWalletsData(getState().main)
    // FIXME: Test with eip155 wallet first
    const etherWallet = wallets.eip155.address
    console.log('Request etherWallet', etherWallet)
    dispatch(actions.getWalletNFTCollectiblesRequest())
    try {
      const response = await AssetManager.getInstance().getWalletNFTCollections(
        {
          wallet: etherWallet,
          limit: 10,
        }
      )

      console.log('response', response)

      await setTimeout(() => {
        console.log('DONE')
        // dispatch(
        //   actions.getWalletNFTCollectiblesRequestFailure({
        //     message: 'Unable load data',
        //   })
        // )
        dispatch(
          actions.getWalletNFTCollectiblesRequestSuccess({
            wallet: etherWallet,
            collections: response.collections,
          })
        )
      }, 2000)
    } catch (error) {
      console.log('Error:', error)
      dispatch(
        actions.getWalletNFTCollectiblesRequestFailure({
          message: 'Unable load data',
        })
      )
    }
  }
}
