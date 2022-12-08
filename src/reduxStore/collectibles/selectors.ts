import { RootState } from '../types'

const s = (state: RootState) => state.collectibles

export const walletNFTCollectionsSelector = (state: RootState) =>
  s(state).walletNFTCollections
