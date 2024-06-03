import { useAppSelector } from '~/reduxStore/types'

import { selectSelectedAccount } from '../slice'

export function useCurrentIdentity() {
  return useAppSelector(selectSelectedAccount)
}
