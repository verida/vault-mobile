import { useSelector } from 'react-redux'

import { BlockchainWalletWithAccounts } from 'api/types'
import { getWalletsData } from 'reduxStore/wallet/selectors'

// i.e. walletId "near"
type WalletsData = {
  readonly [walletId in string]: BlockchainWalletWithAccounts
}

export function useWalletsData(): WalletsData {
  return useSelector(getWalletsData)
}
