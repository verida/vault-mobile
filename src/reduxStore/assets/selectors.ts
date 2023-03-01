import { RootState } from '../types'

const s = (state: RootState) => state.assets

export const walletNFTCollectionsSelector = (state: RootState) =>
  s(state).walletNFTCollections
