import { useAppSelector } from 'reduxStore/types'

import { getSelectedCryptoWallet } from '../slice'

// TODO: To rename to `useSelectedCryptoWallet`
export function useSelectedWallet() {
  return useAppSelector(getSelectedCryptoWallet)
}
