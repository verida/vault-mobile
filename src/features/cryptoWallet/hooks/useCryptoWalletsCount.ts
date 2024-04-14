import { useAppSelector } from '~/reduxStore/types'

import { getCryptoWalletsCount } from '../slice'

export function useCryptoWalletsCount() {
  return useAppSelector(getCryptoWalletsCount)
}
