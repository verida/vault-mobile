import { useAppSelector } from 'reduxStore/types'

import { getSelectedCryptoWallet } from '../slice'

export function useSelectedWallet() {
  return useAppSelector(getSelectedCryptoWallet)
}
