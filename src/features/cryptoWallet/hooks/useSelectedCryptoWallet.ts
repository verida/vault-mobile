import { useAppSelector } from 'reduxStore/types'

import { getSelectedCryptoWallet } from '../slice'

export function useSelectedCryptoWallet() {
  return useAppSelector(getSelectedCryptoWallet)
}
