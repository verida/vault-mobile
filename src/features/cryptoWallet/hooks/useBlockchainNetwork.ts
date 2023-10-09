import { ChainId } from 'caip'
import { getBlockchainNetwork } from 'features/cryptoWallet'
import { useSelector } from 'react-redux'

import { RootState } from 'reduxStore/types'

export function useBlockchainNetwork(chainId: ChainId) {
  return useSelector<RootState>((state) => getBlockchainNetwork(state, chainId))
}
