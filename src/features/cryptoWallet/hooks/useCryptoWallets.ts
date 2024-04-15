import { useAppSelector } from '~/reduxStore/types'

import { getCryptoWallets } from '../slice'

export function useCryptoWallets() {
  return useAppSelector(getCryptoWallets)
}
