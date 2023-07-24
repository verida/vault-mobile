import { useAppSelector } from 'reduxStore/types'

import { getSelectedWalletId } from '../slice'

export function useMaybeSelectedWalletId() {
  return useAppSelector(getSelectedWalletId)
}
