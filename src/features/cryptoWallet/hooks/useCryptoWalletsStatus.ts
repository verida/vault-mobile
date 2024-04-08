import { useAppSelector } from '~/reduxStore/types'

import { getCryptoWalletStatus } from '../slice'

export function useCryptoWalletsStatus() {
  return useAppSelector(getCryptoWalletStatus)
}
