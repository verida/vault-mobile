import { NFTCollection } from 'api/types'
import { LOG_OUT } from 'reduxStore/general/action-types'

import { Reducer } from '../types'

export interface CollectiblesState {
  walletNFTCollections?: Record<string, NFTCollection[]>
}

const initialState: CollectiblesState = {}

export const collectiblesReducer: Reducer<CollectiblesState> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case 'GET_WALLET_NFT_COLLECTIBLES_SUCCESS':
      const walletNFTCollections = { ...state.walletNFTCollections }
      walletNFTCollections[action.payload.wallet] = action.payload.collections
      return {
        ...state,
        walletNFTCollections,
      }

    case LOG_OUT as any:
      return initialState

    default:
      return state
  }
}
