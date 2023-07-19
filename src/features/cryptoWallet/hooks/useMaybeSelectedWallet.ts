import { useAppSelector } from 'reduxStore/types'

import { getWallets } from '../slice'

export function useMaybeSelectedWallet() {
  return useAppSelector(getWallets)
}
