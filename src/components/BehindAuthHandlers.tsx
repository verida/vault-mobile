import { FC } from 'react'

import { useDeepLinksHandler } from '~/features/deepLinks'
import { useRemoteNotifications } from '~/features/notifications'
import { useWatchPublicProfileChanges } from '~/features/profiles'
// import { useEventHandlers } from '~/hooks'

// Main place to register and handle app events after the user has authenticated
export const BehindAuthHandlers: FC = () => {
  // useEventHandlers()
  useWatchPublicProfileChanges()
  useDeepLinksHandler()
  useRemoteNotifications()

  return null
}
