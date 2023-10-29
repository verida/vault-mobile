import { ChainId } from 'caip'
import { getMaybeBlockchainNetwork } from 'features/cryptoWallet'
import { useSelector } from 'react-redux'

import { BlockchainNetwork } from 'api/types'
import { RootState } from 'reduxStore/types'

export function useMaybeBlockchainNetwork(
  chainId: ChainId | null | undefined
): BlockchainNetwork | undefined {
  return useSelector<RootState, BlockchainNetwork | undefined>((state) =>
    getMaybeBlockchainNetwork(state, chainId)
  )
}
