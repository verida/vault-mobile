import { ChainId } from 'caip'
import { getBlockchainNetworks } from 'features/wallets'

const s = (state) => state.main

// export const getSelectedAccount = (state) => s(state).selectedAccount

// export const getAccountPublicProfile = (state) => s(state).publicProfileData

export const getBlockchainNetwork = (state, chainIdObj) => {
  const networks = getBlockchainNetworks(state)
  const chainId = new ChainId(chainIdObj).toString()

  if (networks[chainId]) return networks[chainId]

  throw new Error(`Unknown blockchain network: ${chainId}`)
}

export const getBlockchainNetworkLabel = (network) => {
  return `${network.label}`
}
