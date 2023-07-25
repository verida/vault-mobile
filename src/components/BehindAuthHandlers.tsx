import { useDeepLinksHandler } from 'features/deepLinks'
import { useWatchPublicProfileChanges } from 'features/profiles'
import { useEventHandlers } from 'hooks'
import { FC } from 'react'

// Main place to register and handle app events after the user has authenticated
export const BehindAuthHandlers: FC = () => {
  useEventHandlers()
  useWatchPublicProfileChanges()
  useDeepLinksHandler()

  return null
}
