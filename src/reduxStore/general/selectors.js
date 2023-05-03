const s = (state) => state.main

export const authenticatedSelector = (state) => s(state).authenticated

export const getBlockchainNetworks = (state) => {
  return s(state).blockchainNetworks
}
