import { useAppSelector } from 'reduxStore/types'

import { getSelectedCryptoWalletId } from '../slice'

export function useSelectedWalletId() {
  return useAppSelector(getSelectedCryptoWalletId)
}
