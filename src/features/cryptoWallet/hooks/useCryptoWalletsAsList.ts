import { useAppSelector } from '~/reduxStore/types'

import { getCryptoWalletAsList } from '../slice'

export function useCryptoWalletsAsList() {
  return useAppSelector(getCryptoWalletAsList)
}
