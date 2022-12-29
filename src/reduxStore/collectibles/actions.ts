import { NFTCollection } from 'api/types'
import { ReduxError } from 'reduxStore/types'

import { createAction, createErrorAction } from '../helpers'

export function getWalletNFTCollectiblesRequest() {
  return createAction('GET_WALLET_NFT_COLLECTIBLES_REQUEST')
}

export function getWalletNFTCollectiblesRequestSuccess(payload: {
  wallet: string
  collections: NFTCollection[]
}) {
  return createAction('GET_WALLET_NFT_COLLECTIBLES_SUCCESS', payload)
}

export function getWalletNFTCollectiblesRequestFailure<E extends ReduxError>(
  error: E
) {
  return createErrorAction('GET_WALLET_NFT_COLLECTIBLES_FAILURE', error)
}
