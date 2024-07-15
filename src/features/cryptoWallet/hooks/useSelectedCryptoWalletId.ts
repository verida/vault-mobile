import { useAppSelector } from '~/reduxStore/types'

import { getSelectedCryptoWalletId } from '../slice'

export function useSelectedCryptoWalletId() {
  return useAppSelector(getSelectedCryptoWalletId)
}
