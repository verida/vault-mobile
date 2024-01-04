import { useAppSelector } from 'reduxStore/types'

import { selectSelectedPublicProfile } from '../slice'

export function useCurrentProfile() {
  return useAppSelector(selectSelectedPublicProfile)
}
