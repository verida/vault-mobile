import { useAppSelector } from 'reduxStore/types'

import { getSelectedCryptoWalletId } from '../slice'

// TODO: To rename to `useSelectedCryptoWalletId`
export function useSelectedWalletId() {
  return useAppSelector(getSelectedCryptoWalletId)
}
